import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import path from 'path'
import fs from 'fs'

const prisma = new PrismaClient()

// 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const SHEET_DAY_MAP: Record<string, number[]> = {
  'Saturday and Tuesday': [6, 2],
  'Sunday and Wednesday': [0, 3],
  'Monday and Thursday': [1, 4],
  'Friday': [5],
  'daily': [0, 1, 2, 3, 4, 5, 6],
}

const COL = {
  FULL_NAME: 1,
  NICK_NAME: 2,
  CHILDREN: 3,
  NATIONAL_ID: 4,
  PHONE: 5,
  LOCATION: 6,
  MEALS: 7,
}

const DEFAULT_LOCATION_NAME = 'وسط'
const FALLBACK_PHONE_PREFIX = 'لا يوجد'

// ── Logger: يكتب في console وفي ملف في نفس الوقت ──────────────────────────────
const logLines: string[] = []
function log(msg: string) {
  console.log(msg)
  logLines.push(msg)
}
function saveLog() {
  const logPath = path.resolve(__dirname, 'seed-debug.log')
  fs.writeFileSync(logPath, logLines.join('\n'), 'utf8')
  console.log(`\n📄 Full log saved to: ${logPath}`)
}

function str(val: unknown): string {
  return String(val ?? '').trim()
}

function normalizePhone(raw: unknown): string {
  const cleaned = str(raw).replace(/\s+/g, '').replace(/\D/g, '')
  if (!cleaned) return ''
  if (cleaned.startsWith('20') && cleaned.length === 12) return '0' + cleaned.slice(2)
  if (!cleaned.startsWith('0') && cleaned.length === 10) return '0' + cleaned
  return cleaned
}

type BeneficiaryData = {
  fullName: string
  nickName: string | null
  phone: string
  children: number
  locationId: string
  meals: number
  days: Set<number>
  seenInSheets: string[] // ← للـ debug
}

export async function seedBeneficiaries() {
  log('📥 Loading Excel file...')

  const filePath = path.resolve(__dirname, 'beneficiaries.xlsx')
  const workbook = XLSX.readFile(filePath)

  const dbLocations = await prisma.location.findMany()
  const locationMap = new Map(dbLocations.map((l) => [l.name.trim(), l.id]))

  if (!locationMap.has(DEFAULT_LOCATION_NAME)) {
    const loc = await prisma.location.create({
      data: { name: DEFAULT_LOCATION_NAME, description: 'منطقة وسط البلد' },
    })
    locationMap.set(DEFAULT_LOCATION_NAME, loc.id)
  }

  const phoneToId = new Map<string, string>()
  let created = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  const allBeneficiaries = new Map<string, BeneficiaryData>()

  // ── Pass 1: Pre-scan ─────────────────────────────────────────────────────────
  log('\n══════════════════════════════════════════')
  log('🔍 PASS 1: Pre-scanning sheets')
  log('══════════════════════════════════════════')

  for (const sheetName of Object.keys(SHEET_DAY_MAP)) {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) {
      log(`⚠️  Sheet not found: "${sheetName}"`)
      continue
    }

    const eligibilityDays = SHEET_DAY_MAP[sheetName]
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null })
    const dataRows = rows.slice(1).filter((row) => str(row[COL.FULL_NAME]) || str(row[COL.NICK_NAME]))

    log(`\n📋 Sheet: "${sheetName}" → eligibilityDays=[${eligibilityDays.join(',')}] | ${dataRows.length} rows`)
    log('─'.repeat(60))

    for (const row of dataRows) {
      let fullName = str(row[COL.FULL_NAME])
      let nickName = str(row[COL.NICK_NAME]) || null

      if (!fullName && nickName) {
        fullName = nickName
        nickName = null
      }

      if (!fullName) { skipped++; continue }

      const children = Number(row[COL.CHILDREN] ?? 0) || 0
      const phone = normalizePhone(row[COL.PHONE])
      const locName = str(row[COL.LOCATION])
      const meals = Number(row[COL.MEALS] ?? 1) || 1

      let locationId: string
      if (locName && locationMap.has(locName)) {
        locationId = locationMap.get(locName)!
      } else if (locName && !locationMap.has(locName)) {
        const newLoc = await prisma.location.create({ data: { name: locName } })
        locationMap.set(locName, newLoc.id)
        locationId = newLoc.id
      } else {
        locationId = locationMap.get(DEFAULT_LOCATION_NAME)!
      }

      const resolvedPhone = phone || `${FALLBACK_PHONE_PREFIX}_${fullName.replace(/\s+/g, '_')}`

      if (allBeneficiaries.has(resolvedPhone)) {
        // ── مكرر: شخص موجود من شيت تاني ──────────────────────────────────
        const existing = allBeneficiaries.get(resolvedPhone)!
        const beforeDays = Array.from(existing.days)
        for (const d of eligibilityDays) existing.days.add(d)
        const afterDays = Array.from(existing.days)
        existing.seenInSheets.push(sheetName)

        log(`  🔁 DUPLICATE FOUND: "${fullName}"`)
        log(`     resolvedPhone : "${resolvedPhone}"`)
        log(`     rawPhone      : "${str(row[COL.PHONE])}"`)
        log(`     days before   : [${beforeDays.join(',')}]`)
        log(`     days added    : [${eligibilityDays.join(',')}]`)
        log(`     days after    : [${afterDays.join(',')}]`)
        log(`     seen in sheets: [${existing.seenInSheets.join(' | ')}]`)
      } else {
        // ── جديد ──────────────────────────────────────────────────────────
        allBeneficiaries.set(resolvedPhone, {
          fullName,
          nickName,
          phone: resolvedPhone,
          children,
          locationId,
          meals,
          days: new Set(eligibilityDays),
          seenInSheets: [sheetName],
        })
        log(`  ➕ NEW: "${fullName}" | phone="${resolvedPhone}" | days=[${eligibilityDays.join(',')}]`)
      }
    }
  }

  // ── Summary of cross-sheet people ───────────────────────────────────────────
  log('\n══════════════════════════════════════════')
  log('📊 CROSS-SHEET SUMMARY')
  log('══════════════════════════════════════════')
  let crossCount = 0
  for (const [phone, data] of allBeneficiaries) {
    if (data.seenInSheets.length > 1) {
      crossCount++
      log(`  👤 "${data.fullName}"`)
      log(`     phone : ${phone}`)
      log(`     sheets: ${data.seenInSheets.join(' | ')}`)
      log(`     days  : [${Array.from(data.days).sort((a,b)=>a-b).join(',')}]`)
    }
  }
  log(`\n  Total cross-sheet beneficiaries: ${crossCount}`)
  log(`  Total unique beneficiaries: ${allBeneficiaries.size}`)

  // ── Pass 2: Write to DB ──────────────────────────────────────────────────────
  log('\n══════════════════════════════════════════')
  log('💾 PASS 2: Writing to database')
  log('══════════════════════════════════════════\n')

  for (const [resolvedPhone, data] of allBeneficiaries) {
    try {
      const existing = await prisma.beneficiary.findFirst({
        where: { phone: resolvedPhone },
      })

      const daysArray = Array.from(data.days).sort((a, b) => a - b)

      if (existing) {
        const existingDays = await prisma.beneficiaryEligibilityDay.findMany({
          where: { beneficiaryId: existing.id },
          select: { dayOfWeek: true },
        })
        const existingDaySet = new Set(existingDays.map((d) => d.dayOfWeek))
        const newDays = daysArray.filter((d) => !existingDaySet.has(d))

        if (newDays.length > 0) {
          await prisma.beneficiaryEligibilityDay.createMany({
            data: newDays.map((dayOfWeek) => ({ beneficiaryId: existing.id, dayOfWeek })),
            skipDuplicates: true,
          })
        }

        phoneToId.set(resolvedPhone, existing.id)
        log(`🔄 DB-Updated: "${existing.fullName}" | existingDays=[${Array.from(existingDaySet).sort((a,b)=>a-b).join(',')}] | addedDays=[${newDays.join(',')}]`)
        updated++
      } else {
        const created_ = await prisma.beneficiary.create({
          data: {
            fullName: data.fullName,
            nickName: data.nickName,
            phone: resolvedPhone,
            numberOfChildren: data.children,
            mealType: 'KITCHEN',
            maxMealsPerDay: data.meals,
            locationId: data.locationId,
            isActive: true,
            eligibilityDays: {
              create: daysArray.map((dayOfWeek) => ({ dayOfWeek })),
            },
          },
        })

        phoneToId.set(resolvedPhone, created_.id)
        log(`✅ DB-Created: "${data.fullName}" | days=[${daysArray.join(',')}]`)
        created++
      }
    } catch (err) {
      log(`❌ Error on "${data.fullName}": ${String(err)}`)
      errors++
    }
  }

  log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Seeding done!
✅ Created : ${created}
🔄 Updated : ${updated}
⏭️ Skipped : ${skipped}
❌ Errors  : ${errors}
━━━━━━━━━━━━━━━━━━━━━━━━━━`)

  saveLog()
}

seedBeneficiaries()