export function fullName(person: { firstName: string; lastName: string }): string {
  return `${person.firstName} ${person.lastName}`.trim();
}

export function publicStudent(student: {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  section: string;
  studentNumber: string;
  status: string;
}) {
  return {
    id: student.id,
    name: fullName(student),
    firstName: student.firstName,
    lastName: student.lastName,
    className: student.className,
    section: student.section,
    studentNumber: student.studentNumber,
    status: student.status,
  };
}
