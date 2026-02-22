import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import path from 'path'

const prisma = new PrismaClient()

const SHEET_NAME = 'Home'

const COL = {
  FULL_NAME: 1,
  NICK_NAME: 2,
}

const DEFAULT_LOCATION_NAME = 'وسط'
const FALLBACK_PHONE_PREFIX = 'لا يوجد'

function str(val: unknown): string {
  return String(val ?? '').trim()
}

export async function seedHomeBeneficiaries() {
  console.log('📥 Loading Excel file...')

  const filePath = path.resolve(__dirname, 'beneficiaries.xlsx')
  const workbook = XLSX.readFile(filePath)

  const sheet = workbook.Sheets[SHEET_NAME]
  if (!sheet) {
    console.error(`❌ Sheet "${SHEET_NAME}" not found in workbook!`)
    console.log('Available sheets:', workbook.SheetNames)
    process.exit(1)
  }

  // Ensure default location exists
  const dbLocations = await prisma.location.findMany()
  const locationMap = new Map(dbLocations.map((l) => [l.name.trim(), l.id]))

  if (!locationMap.has(DEFAULT_LOCATION_NAME)) {
    const loc = await prisma.location.create({
      data: { name: DEFAULT_LOCATION_NAME, description: 'منطقة وسط البلد' },
    })
    locationMap.set(DEFAULT_LOCATION_NAME, loc.id)
  }

  const defaultLocationId = locationMap.get(DEFAULT_LOCATION_NAME)!

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: null,
  })

  // Skip header row, keep rows that have at least a name or nickname
  const dataRows = rows
    .slice(1)
    .filter((row) => str(row[COL.FULL_NAME]) || str(row[COL.NICK_NAME]))

  console.log(`📋 Sheet "${SHEET_NAME}": ${dataRows.length} rows found`)
  console.log('💾 Writing to database...\n')

  let created = 0
  let skipped = 0
  let errors = 0

  for (const row of dataRows) {
    let fullName = str(row[COL.FULL_NAME])
    let nickName = str(row[COL.NICK_NAME]) || null

    // لو الاسم فاضي بس اسم الشهرة موجود → نعكسهم
    if (!fullName && nickName) {
      fullName = nickName
      nickName = null
    }

    if (!fullName) {
      skipped++
      continue
    }

    // Stable fallback phone based on name
    const resolvedPhone = `${FALLBACK_PHONE_PREFIX}_HOME_${fullName.replace(/\s+/g, '_')}`

    try {
      const existing = await prisma.beneficiary.findFirst({
        where: { phone: resolvedPhone },
      })

      if (existing) {
        console.log(`  ⏭️  Already exists: "${fullName}" — skipping`)
        skipped++
        continue
      }

      await prisma.beneficiary.create({
        data: {
          fullName,
          nickName,
          // مالهمش موبايل ومالهمش أيام
          phone: resolvedPhone,
          numberOfChildren: 0,
          mealType: 'HOME',
          maxMealsPerDay: 1,
          locationId: defaultLocationId,
          isActive: true,
          // مالهمش eligibilityDays خالص
        },
      })

      console.log(`  ✅ Created: "${fullName}"${nickName ? ` (${nickName})` : ''}`)
      created++
    } catch (err) {
      console.error(`  ❌ Error on "${fullName}":`, err)
      errors++
    }
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Home seeding done!
✅ Created : ${created}
⏭️ Skipped : ${skipped}
❌ Errors  : ${errors}
━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

seedHomeBeneficiaries()