import type { Customer } from '../types/database';

export function getGoogleMapsRouteUrl(customer: Customer): string {
  if (!customer) return '#';
  
  // Výchozí bod pro techniky
  const startAddress = "Netto Electronics, Praha";
  
  // Chytře poskládáme cílovou adresu a přeskočíme prázdné hodnoty (aby nevznikaly prázdné čárky)
  const destinationParts = [
    customer.street,
    `${customer.zip || ''} ${customer.city || ''}`.trim(),
    customer.country
  ].filter(Boolean); // filter(Boolean) vyhodí vše, co je prázdné
  
  const destinationAddress = destinationParts.join(', ');
  
  // Oficiální Google Maps API odkaz pro navigaci (dir = directions)
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startAddress)}&destination=${encodeURIComponent(destinationAddress)}`;
}