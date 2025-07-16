import { notFound } from 'next/navigation'
import { getSchoolBySlug, getSchoolContent } from '@/lib/auth'
import { SchoolLanding } from '@/components/school-landing'

export default async function SchoolPage({ params }: { params: { schoolSlug: string } }) {
  try {
    const school = await getSchoolBySlug(params.schoolSlug)
    const content = await getSchoolContent(school.id)

    return <SchoolLanding school={school} content={content} />
  } catch (error) {
    notFound()
  }
}