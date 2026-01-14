export interface PhotoData {
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  description: string;
  title: string;
  language: string;
  isSchematic: boolean;
  attribution: {
    required: boolean;
    text: string;
    license: string;
    link: string;
  };
}

export function getBestAircraftPhoto(
  aircraftName: string,
  ipmsUrl: string
): Promise<PhotoData | null>;
