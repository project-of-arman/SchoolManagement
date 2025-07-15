import { supabase } from './supabase'

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserRole(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('role, school_id')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSchoolBySlug(slug: string) {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  return data
}

export async function getSchoolContent(schoolId: string) {
  const { data, error } = await supabase
    .from('school_content')
    .select('*')
    .eq('school_id', schoolId)
  
  if (error) throw error
  return data
}

export async function createSchoolOwner(userId: string, schoolId: string, email: string, fullName: string) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      email,
      role: 'school_owner',
      school_id: schoolId,
      full_name: fullName
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function checkSlugAvailability(slug: string) {
  const { data, error } = await supabase
    .from('schools')
    .select('id')
    .eq('slug', slug)
    .single()
  
  // If no data found, slug is available
  return !data
}