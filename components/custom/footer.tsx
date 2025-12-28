import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const INFO = {
    menuItems: [
      {
        title: "Product",
        links: [{ text: "Documentation", url: "https://docs.compyle.ai" }],
      },
      {
        title: "Legal",
        links: [
          {
            text: "Terms of Service",
            url: "https://app.termly.io/policy-viewer/policy.html?policyUUID=ffe987c4-1452-4c5f-8f9d-4dd1abd70f86",
          },
          {
            text: "Privacy Policy",
            url: "https://app.termly.io/policy-viewer/policy.html?policyUUID=0168892b-56de-455b-8e10-fbf1666a4f83",
          },
        ],
      },
      {
        title: "Community",
        links: [{ text: "Discord", url: "https://discord.gg/U9djmRTDB4" }],
      },
      {
        title: "Social",
        links: [
          { text: "X", url: "https://x.com/compyle_ai" },
          {
            text: "LinkedIn",
            url: "https://www.linkedin.com/company/compyle-ai/",
          },
        ],
      },
    ],
  };

  return (
    <>
      <Separator />
      <section className="mt-12">
        <div className="container mx-auto">
          <footer>
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-6 px-6">
              <div className="col-span-2 mb-8 lg:mb-0">
                <div className="flex items-center gap-3 font-medium lg:justify-start">
                  <Image
                    src="/compyle.svg"
                    width={35}
                    height={35}
                    alt="Compyle.ai logo"
                    className="object-contain"
                  />
                  <span className="font-semibold text-lg tracking-tighter">
                    Compyle Apps
                  </span>
                </div>
              </div>
              {INFO.menuItems.map((section, sectionIdx) => (
                <div key={sectionIdx}>
                  <h3 className="mb-4 font-bold">{section.title}</h3>
                  <ul className="text-muted-foreground space-y-4">
                    {section.links.map((link, linkIdx) => (
                      <li
                        key={linkIdx}
                        className="hover:text-primary font-medium"
                      >
                        <Link
                          target="_blank"
                          rel="noopener noreferrer"
                          href={link.url}
                        >
                          {link.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="text-muted-foreground mt-24 flex flex-col justify-between gap-4 border-t pt-8 text-sm font-medium md:flex-row md:items-center px-6 mb-5">
              <p>
                © {new Date().getFullYear()} SmartAppetite Corporation. All
                Rights Reserved.
              </p>
            </div>
          </footer>
        </div>
      </section>
    </>
  );
}
