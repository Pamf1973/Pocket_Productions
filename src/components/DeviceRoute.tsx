import { ReactElement } from 'react';

interface Props {
  mobile: ReactElement;
  desktop: ReactElement;
}

function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export default function DeviceRoute({ mobile, desktop }: Props) {
  return isMobileDevice() ? mobile : desktop;
}
