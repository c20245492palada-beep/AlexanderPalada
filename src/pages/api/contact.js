import { CONTACT_TO_EMAIL, RESEND_API_KEY } from "astro:env/server";
import { Resend } from "resend";

export const prerender = false;

export async function POST({ request, redirect }) {
  const formData = await request.formData();
  if (formData.get("contact_reference")) {
    return redirect("/thanks", 303);
  }

  const getTextField = (fieldName) => {
    const value = formData.get(fieldName);
    return typeof value === "string" ? value.trim() : "";
  };
  const name = getTextField("name").replace(/[\r\n]/g, " ");
  const email = getTextField("email");
  const message = getTextField("message");

  if (
    !name ||
    name.length > 100 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !message ||
    message.length > 2000
  ) {
    return redirect("/error", 303);
  }

  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) {
    console.error("Missing RESEND_API_KEY or CONTACT_TO_EMAIL");
    return redirect("/error", 303);
  }

  const resend = new Resend(RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: "Website Contact <onboarding@resend.dev>",
    to: CONTACT_TO_EMAIL,
    replyTo: email,
    subject: `Portfolio contact from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  });

  if (error) {
    console.error("Resend failed to send the portfolio contact email:", error);
    return redirect("/error", 303);
  }

  return redirect("/thanks", 303);
}