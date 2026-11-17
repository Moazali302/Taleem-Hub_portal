export interface SchoolRouteIdentity {
  school_name: string;
  school_id: string;
}

export function schoolNameSlug(name: string): string {
  return (
    name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'school'
  );
}

export function schoolRouteSlug(
  school: SchoolRouteIdentity,
  schools: readonly SchoolRouteIdentity[],
): string {
  const nameSlug = schoolNameSlug(school.school_name);
  const duplicateName = schools.some(
    (candidate) =>
      candidate.school_id !== school.school_id &&
      schoolNameSlug(candidate.school_name) === nameSlug,
  );

  return duplicateName ? `${nameSlug}-${schoolNameSlug(school.school_id)}` : nameSlug;
}
