import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col gap-6 row-start-2 items-center text-center">
      <div className="font-logo text-[6rem] -tracking-[0.5rem] [text-shadow:_0_0_2px_#ffffff,_0_0_5px_#6366f1]">
        PILGRIM
      </div>
      <div className="text-lg">
        Delve Deep. Decipher the Unknown. Determine Your Fate.
      </div>
      <div className="mx-auto max-w-2xl tracking-wide text-muted-foreground">
        In a world where the boundaries of reality are fragile, a series of
        unexplained disappearances beckons the brave to seek answers. Embark on
        a journey where every thread pulled can unravel a tapestry of truths or
        weave a web of deceit.
      </div>
      <div>
        <Link href="/game">
          <Button>Begin</Button>
        </Link>
      </div>
    </div>
  );
}
