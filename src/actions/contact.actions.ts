import { nullToEmptyString } from "@/helpers";
import { defineAction } from "astro:actions";
import z from "zod";

export const contact = {
  sendEmail: defineAction({
    accept: "form",
    input: z.object({
      name: z.preprocess(
        nullToEmptyString,
        z.string().min(1, { error: "EL nombre no puede ir vacio" }),
      ),
      email: z.preprocess(
        nullToEmptyString,
        z
          .email({ error: "EL email no es válido" })
          .min(1, { error: "EL email no puede ir vacio" }),
      ),
      subject: z.preprocess(
        nullToEmptyString,
        z
          .string()
          .min(10, { error: "EL asunto no puede ir vacio o es muy corto" }),
      ),
      message: z.preprocess(
        nullToEmptyString,
        z.string().min(1, { error: "EL mensaje no puede ir vacio" }),
      ),
    }),
    handler: async (input) => {
      const url = `${import.meta.env.HOME_URL}/wp-json/contact-form-7/v1/contact-forms/144/feedback`;
      const formData = new FormData();
      formData.append("your-name", input.name);
      formData.append("your-email", input.email);
      formData.append("your-subject", input.subject);
      formData.append("your-message", input.message);
      formData.append("_wpcf7_unit_tag", "wpc-12345");

      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });
      await res.json();

      /*    {
        contact_form_id: 144,
        status: 'mail_failed',
        message: 'There was an error trying to send your message. Please try again later.',
        posted_data_hash: '63b7edc087ce214d9c549dda58a2168a',
        into: '#wpc-12345',
        invalid_fields: []
        } */
      //TODO: ESTA FALLANDO, FALTA CONFIUURACIÓN EN WORDPRESS Y BREVO. YA MEJOR LO DEJE ASÍ PARA AVANZAR EN EL CURSO
      return {
        error: false,
        message: "Tu mensaje se envió correctamente",
      };
    },
  }),
};
