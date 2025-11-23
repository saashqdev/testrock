import { ContactFormBlockDto } from "@/modules/pageBlocks/components/blocks/marketing/contact/ContactFormBlockDto";
import ContactFormVariantSimple from "./ContactFormVariantSimple";

export default function ContactFormBlock({ item }: { item: ContactFormBlockDto }) {
  return <>{item.style === "simple" && <ContactFormVariantSimple item={item} />}</>;
}
