import { NextResponse } from 'next/server'
import { checkConflicts } from '@/lib/conflict-detection'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await checkConflicts(body)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
