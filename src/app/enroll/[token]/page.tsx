import { hashToken } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { evaluateEnrollmentSession } from "@/lib/services/enrollment";
import { EnrollCapture } from "@/components/enroll-capture";
import { fullName } from "@/lib/names";

export default async function MobileEnrollPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const enrollment = await prisma.enrollmentSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { student: true },
  });

  if (!enrollment) {
    return (
      <Message title="Enrollment session was not found." body="Ask the admin to generate a new QR code." />
    );
  }

  const state = evaluateEnrollmentSession(enrollment);
  if (state === "used") {
    return (
      <Message
        title="This enrollment link has already been used."
        body="Ask the admin to start a new fingerprint enrollment."
      />
    );
  }
  if (state === "expired") {
    return (
      <Message
        title="This enrollment session has expired."
        body="Enrollment QR codes expire after 5 minutes. Ask the admin to generate a new link."
      />
    );
  }

  return (
    <EnrollCapture
      token={token}
      studentName={fullName(enrollment.student)}
      expiresAt={enrollment.expiresAt.toISOString()}
    />
  );
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-ink-muted">{body}</p>
      </div>
    </div>
  );
}
