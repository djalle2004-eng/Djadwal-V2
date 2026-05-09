import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: "البريد الإلكتروني غير مسجل" }, { status: 404 });
    }

    const token = randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await db.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetExpiry: expiry,
      },
    });

    // Setup Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"نظام جدول" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "استعادة كلمة المرور - نظام جدول",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>طلب استعادة كلمة المرور</h2>
          <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. يرجى الضغط على الرابط أدناه:</p>
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">إعادة تعيين كلمة المرور</a>
          <p>إذا لم تطلب ذلك، يرجى تجاهل هذا البريد.</p>
          <p>هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "تم إرسال الرابط بنجاح" });
  } catch (error) {
    console.error("Reset Password POST Error:", error);
    return NextResponse.json({ message: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "الرابط غير صالح أو انتهت صلاحيته" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpiry: null,
      },
    });

    return NextResponse.json({ message: "تم تحديث كلمة المرور بنجاح" });
  } catch (error) {
    console.error("Reset Password PUT Error:", error);
    return NextResponse.json({ message: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}
