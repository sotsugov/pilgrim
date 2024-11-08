export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-6 row-start-2 items-center">
        <div className="font-logo text-[6rem] -tracking-[0.5rem] [text-shadow:_0_0_2px_#ffffff,_0_0_5px_#6366f1]">
          PILGRIM
        </div>
        <div className="text-lg">
          Delve Deep. Decipher the Unknown. Determine Your Fate.
        </div>
        <div className="text-center mx-auto max-w-2xl tracking-wide text-gray-600">
          In a world where the boundaries of reality are fragile, a series of
          unexplained disappearances beckons the brave to seek answers. Embark
          on a journey where every thread pulled can unravel a tapestry of
          truths or weave a web of deceit.
        </div>
        <div>Coming Soon</div>
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="row-start-3 flex gap-6 flex-wrap items-center text-center">
      <a
        className="uppercase font-semibold tracking-tight no-underline text-xs text-gray-800 hover:text-gray-200 transition-colors"
        href="https://isv.ee"
        target="_blank"
        rel="noopener noreferrer"
      >
        A project by ISV
      </a>
    </footer>
  );
}
