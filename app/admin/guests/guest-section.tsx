import { guestRepository } from '@/lib/graduation/guest-repository';
import { GuestManager } from './guest-manager';

export async function GuestSection() {
  const guests = await guestRepository.list();
  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">Graduation guests</h2>
      <GuestManager guests={guests} />
    </section>
  );
}
