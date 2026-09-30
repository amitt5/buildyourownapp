// The BYOA logo. Shared by the landing page and the admin page.
export function Brand({ descriptor = true, href = '#top' }: { descriptor?: boolean; href?: string }) {
  return (
    <a className="brand" href={href} aria-label="BYOA — Build Your Own App">
      <span className="brand-mark" aria-hidden="true"><span className="brand-block brand-by"><span>BY</span></span><span className="brand-block brand-oa"><span>OA</span></span></span>
      {descriptor && <span className="brand-desc" aria-hidden="true">build your own app</span>}
    </a>
  )
}
