import {
  CircleDot,
  Cog,
  Disc,
  Droplets,
  Fuel,
  Gauge,
  Paintbrush,
  Ruler,
  Search,
  Snowflake,
  Warehouse,
  Wrench,
  Zap,
} from 'lucide-react';
import type { Service } from '@/content/services';

/** Иконка направления. Ключи заданы в каталоге услуг, поэтому набор фиксированный. */
const ICONS: Record<Service['icon'], typeof Wrench> = {
  diagnostics: Search,
  alignment: Ruler,
  suspension: Gauge,
  oil: Droplets,
  engine: Cog,
  injector: Fuel,
  gearbox: Wrench,
  brakes: Disc,
  wheel: CircleDot,
  electric: Zap,
  climate: Snowflake,
  paint: Paintbrush,
  warehouse: Warehouse,
};

export default function ServiceIcon({ name, className }: { name: Service['icon']; className?: string }) {
  const Icon = ICONS[name] ?? Wrench;
  return <Icon className={className} aria-hidden="true" strokeWidth={1.7} />;
}
