export async function Footer() {
  return (
    <footer className="border-t border-line/70 bg-ivory">
      <div className="mx-auto max-w-content px-5 py-8 md:px-8">
        <p className="font-body text-xs text-muted">© {new Date().getFullYear()} Shipda</p>
      </div>
    </footer>
  );
}
