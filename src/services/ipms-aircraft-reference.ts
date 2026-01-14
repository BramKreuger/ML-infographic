/**
 * IPMS.nl Aircraft Reference Database
 * Nederlandse Militaire Luchtvaart - Complete vliegtuigenlijst met URLs
 *
 * Gebruik:
 * import { findAircraftUrl, searchAircraft, AIRCRAFT_DATABASE } from './ipms-reference.js';
 *
 * const url = findAircraftUrl("Fokker G.1");
 * const results = searchAircraft("spitfire");
 */

interface AircraftEntry {
  name: string;
  url: string;
  aliases?: string[];
}

export const AIRCRAFT_DATABASE: AircraftEntry[] = [
  // A
  { name: "AEG C-IV", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-aeg-c4", aliases: ["AEG C.IV", "AEG C-4"] },
  { name: "Aeronca L-3", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-aeronca-l3" },
  { name: "Aerospatiale AS-355 Twinstar", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-aerospatiale-as355" },
  { name: "Agusta Bell 204 (UH-1)", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-agusta-bell-204", aliases: ["Augusta Bell UH1", "UH-1"] },
  { name: "Agusta Bell AB-412SP", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-agusta-bell-412", aliases: ["Augusta Bell 412SP", "AB-412"] },
  { name: "Agusta Westland AW-139", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-agusta-aw139" },
  { name: "Agusta Westland AW-189", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-agusta-aw189" },
  { name: "Airbus A330 MRTT", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-airbus-mrtt" },
  { name: "Airbus H225 Caracal", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-airbus-caracal" },
  { name: "Airco DeHavilland DH-4", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-d/vliegtuigen-d-dehavil-dh4", aliases: ["DeHavilland DH-4", "DH-4"] },
  { name: "Airspeed Oxford", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-airspeed-oxford" },
  { name: "Albatros B.I", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-albatross-b1" },
  { name: "Albatros B.II", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-albatross-b2" },
  { name: "Albatros B.III", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-albatross-b3" },
  { name: "Albatros C.III", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-aviatik-c3" },
  { name: "Albatros C.VII", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-albatross-c7" },
  { name: "Albatros C.X", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-albatross-c10" },
  { name: "Albatros D.III", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-albatross-d3" },
  { name: "Ansaldo SVA-10", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-ansaldo-sva10" },
  { name: "Armstrong Whitworth Sea Hawk", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-aw-seahawk" },
  { name: "Auster AOP", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-auster-aop" },
  { name: "Aviatik C.III", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-aviatik-c3" },
  { name: "AVRO 504A/B/K", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-avro-504", aliases: ["AVRO 504"] },
  { name: "AVRO Anson", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-a/vliegtuigen-a-avro-anson" },

  // B
  { name: "Boeing Scan Eagle", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-b/vliegtuigen-b-boeing-scaneagle", aliases: ["Scan Eagle UAV"] },
  { name: "Bolkow Bo-105", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-b/vliegtuigen-b-bolkow-bo105" },
  { name: "Breguet Atlantic", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-b/vliegtuigen-b-breguet-atlantic" },
  { name: "Brewster B-339 Buffalo", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-b/vliegtuigen-b-brewster-buffalo", aliases: ["Brewster Buffalo"] },
  { name: "Brik (Meel)", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-b/vliegtuigen-b-brik" },
  { name: "Bristol F2B", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-b/vliegtuigen-b-bristol-f2b" },
  { name: "Bucker Bu-131 Jungman", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-b/vliegtuigen-b-bucker-bu131" },

  // C
  { name: "Caudron G-IV", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-c/vliegtuigen-c-caudron-g4" },
  { name: "Cessna 180C", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-c/vliegtuigen-c-cessna-180" },
  { name: "Cessna 402", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-c/vliegtuigen-c-cessna-402" },
  { name: "Cessna 404 Titan II", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-c/vliegtuigen-c-cessna-404" },
  { name: "Commonwealth Wackett", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-c/vliegtuigen-c-commonw-wackett" },
  { name: "Consolidated Catalina", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-c/vliegtuigen-c-consol-catalina" },
  { name: "Consolidated B-24 Liberator", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-c/vliegtuigen-c-consol-b24" },
  { name: "Curtiss CW-21/22", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-c/vliegtuigen-c-curtiss-cw21", aliases: ["Curtiss Demon", "Curtiss Falcon"] },
  { name: "Curtiss H-12", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-c/vliegtuigen-c-curtiss-cw21-2" },
  { name: "Curtiss H75 Hawk", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-c/vliegtuigen-c-curtiss-h72-hawk", aliases: ["P-36"] },
  { name: "Curtiss P-6 Hawk I", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-c/vliegtuigen-c-curtiss-p6-hawk1" },
  { name: "Curtiss P-40", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-c/vliegtuigen-c-curtiss-p40", aliases: ["Warhawk", "Kittyhawk"] },

  // D
  { name: "DeBrouckere Type G/F", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-d/vliegtuigen-d-debrouckere" },
  { name: "DeHavilland DH-9", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-d/vliegtuigen-d-dehavil-dh9", aliases: ["Airco DeHavilland DH-9"] },
  { name: "DeHavilland DH-82 Tiger Moth", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-d/vliegtuigen-d-dehavil-dh82" },
  { name: "DeHavilland DH-85 Leopard Moth", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-d/vliegtuigen-d-dehavil-dh85" },
  { name: "DeHavilland DH-89 Dominie", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-d/vliegtuigen-d-dehavil-dh89" },
  { name: "DeHavilland DH-90 Dragonfly", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-d/vliegtuigen-d-dehavil-dh89-2" },
  { name: "DeHavilland Canada DHC-2 Beaver", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-d/vliegtuigen-d-dehavil-dhc2" },
  { name: "DeHavilland DASH 8-100", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-d/vliegtuigen-d-dehavil-dash8" },

  // E
  { name: "EMBRAER C-390", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-e/vliegtuigen-e-eurocopter-cougar-2" },
  { name: "Eurocopter AS532 Cougar", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-e/vliegtuigen-e-eurocopter-cougar" },

  // F
  { name: "Fairchild 24", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fairchild-24" },
  { name: "Fairchild PT-19", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fairchild-pt19" },
  { name: "Fairchild PT-26", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fairchild-pt26" },
  { name: "Fairey III.D", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fairey-3d" },
  { name: "Fairey Barracuda", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fairey-barracuda" },
  { name: "Fairey Firefly", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fairey-firefly" },
  { name: "Fairey Swordfish", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fairey-swordfish" },
  { name: "Farman HF.20/HF.22", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-farman-hf" },
  { name: "Farman F.40", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-farman-f40" },
  { name: "Felixstowe F-2A", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-felixstowe-f2" },
  { name: "Focke Wulf FW-58B Weihe", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fockewulf-fw58" },
  { name: "Fokker A.1", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-a1", aliases: ["Fokker M.8"] },
  { name: "Fokker B.1", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-b1" },
  { name: "Fokker C.I", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-c1" },
  { name: "Fokker C.IV", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-c4", aliases: ["Fokker C.4", "Fokker DC-1"] },
  { name: "Fokker C.V", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-c5", aliases: ["Fokker C.5"] },
  { name: "Fokker C.VI", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-c6", aliases: ["Fokker C.6"] },
  { name: "Fokker C.VIIw", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-c7", aliases: ["Fokker C.7"] },
  { name: "Fokker C.VIII(w)", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-c8", aliases: ["Fokker C.8"] },
  { name: "Fokker C.IX", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-c9", aliases: ["Fokker C.9"] },
  { name: "Fokker C.X", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-c10", aliases: ["Fokker C.10"] },
  { name: "Fokker C.XIw", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-c11", aliases: ["Fokker C.11"] },
  { name: "Fokker C.XIVw", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-c14", aliases: ["Fokker C.14w"] },
  { name: "Fokker D.III", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-d3", aliases: ["Fokker D.3"] },
  { name: "Fokker D.VII", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-d7", aliases: ["Fokker D.7"] },
  { name: "Fokker D.XVI", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-d21", aliases: ["Fokker D.16"] },
  { name: "Fokker D.XVII", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-d17", aliases: ["Fokker D.17"] },
  { name: "Fokker D.XXI", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-d21", aliases: ["Fokker D.21"] },
  { name: "Fokker D.XXIII", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-d23", aliases: ["Fokker D.23"] },
  { name: "Fokker F.VIIa/3M", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-f7", aliases: ["Fokker F.7a"] },
  { name: "Fokker F.VIIIa", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-f8", aliases: ["Fokker F.8a"] },
  { name: "Fokker F.XVIII", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-f18", aliases: ["Fokker F.18"] },
  { name: "Fokker F-27 Friendship", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-f27", aliases: ["F-27 Troopship"] },
  { name: "Fokker F-27 MPA Maritime", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-f27-mpa" },
  { name: "Fokker F-28 Fellowship", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-f28" },
  { name: "Fokker 50", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-50" },
  { name: "Fokker 60 Enforcer", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-60", aliases: ["Fokker UTA"] },
  { name: "Fokker 70", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-70" },
  { name: "Fokker G.1", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-g1" },
  { name: "Fokker S.II", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-s2", aliases: ["Fokker S.2"] },
  { name: "Fokker S.III", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-s3", aliases: ["Fokker S.3"] },
  { name: "Fokker S.IV", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-s4", aliases: ["Fokker S.4"] },
  { name: "Fokker S.IX", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-s9", aliases: ["Fokker S.9"] },
  { name: "Fokker S-11/S-12 Instructor", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-s11-s12" },
  { name: "Fokker S-13", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-s13" },
  { name: "Fokker S-14 Machtrainer", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-s14" },
  { name: "Fokker T.IV", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-t4", aliases: ["Fokker T.4"] },
  { name: "Fokker T.V", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-t5", aliases: ["Fokker T.5"] },
  { name: "Fokker T.VIIIw", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-t8", aliases: ["Fokker T.8"] },
  { name: "Fokker T.IX", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-fokker-t8-2", aliases: ["Fokker T.9"] },
  { name: "Friedrichshafen FF19", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-friedrichshafen-ff19" },
  { name: "Friedrichshafen FF29", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-friedrichshafen-ff29" },
  { name: "Friedrichshafen FF33", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-friedrichshafen-ff33" },
  { name: "Friedrichshafen FF49", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-friedrichshafen-ff49" },
  { name: "Friedrichshafen G.III", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-f/vliegtuigen-f-friedrichshafen-g3", aliases: ["Friedrichshafen G.3"] },

  // G
  { name: "General Atomics MQ-9", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-g/vliegtuigen-g-mq9", aliases: ["MQ-9 Reaper"] },
  { name: "General Dynamics F-16", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-g/vliegtuigen-g-gendyn-f16", aliases: ["F-16 Fighting Falcon", "Lockheed F-16"] },
  { name: "Gloster Meteor", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-g/vliegtuigen-g-gloster-meteor" },
  { name: "Gotha G.IV", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-g/vliegtuigen-g-gota-g4", aliases: ["Gotha G.4"] },
  { name: "Gotha WD.11", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-g/vliegtuigen-g-gota-wd11" },
  { name: "Grumman S-2 Tracker", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-g/vliegtuigen-g-grumman-s2", aliases: ["CS-2 Tracker"] },
  { name: "Grumman TBM-3 Avenger", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-g/vliegtuigen-g-grumman-avenger" },
  { name: "Gulfstream IV", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-g/vliegtuigen-g-gulfstream-g4", aliases: ["Gulfstream G.4"] },

  // H
  { name: "Halberstadt CL.II", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-h/vliegtuigen-h-halberstadt-cl2", aliases: ["Halberstadt CL.2"] },
  { name: "Halberstadt CL.IV", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-h/vliegtuigen-h-halberstadt-cl4", aliases: ["Halberstadt CL.4"] },
  { name: "Handley Page O/400", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-h/vliegtuigen-h-handleypage-0400" },
  { name: "Hannover CL.II", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-h/vliegtuigen-h-hannover-cl2", aliases: ["Hannover CL.2"] },
  { name: "Hansa Brandenburg W-12", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-h/vliegtuigen-h-hansabrandenburg-w12", aliases: ["Brandenburg W-12"] },
  { name: "Hansa Brandenburg W-29", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-h/vliegtuigen-h-hansabrandenburg-w29", aliases: ["Brandenburg W-29"] },
  { name: "Hawker Hunter", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-h/vliegtuigen-h-hawker-hunter" },
  { name: "Hawker Hurricane IIb", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-h/vliegtuigen-h-hawker-hurricane", aliases: ["Hurricane"] },
  { name: "Hawker Sea Fury", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-h/vliegtuigen-h-hawker-seafury-m" },
  { name: "Hiller H-23 Raven", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-h/vliegtuigen-h-hiller-h23" },

  // K
  { name: "Koolhoven FK.31", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-k/vliegtuigen-k-koolhoven-fk31" },
  { name: "Koolhoven FK.43", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-k/vliegtuigen-k-koolhoven-fk43" },
  { name: "Koolhoven FK.46", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-k/vliegtuigen-k-koolhoven-fk46" },
  { name: "Koolhoven FK.49", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-k/vliegtuigen-k-koolhoven-fk49" },
  { name: "Koolhoven FK.51", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-k/vliegtuigen-k-koolhoven-fk51" },
  { name: "Koolhoven FK.52", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-k/vliegtuigen-k-koolhoven-fk52" },
  { name: "Koolhoven FK.56", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-k/vliegtuigen-k-koolhoven-fk56" },
  { name: "Koolhoven FK.58", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-k/vliegtuigen-k-koolhoven-fk58" },

  // L
  { name: "Lockheed 12", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-l/vliegtuigen-l-lockheed-212" },
  { name: "Lockheed F-35", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-l/vliegtuigen-l-lockheed-f35", aliases: ["F-35 Lightning II", "JSF"] },
  { name: "Lockheed F-104 Starfighter", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-l/vliegtuigen-l-lockheed-f104" },
  { name: "Lockheed Harpoon PV-2", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-l/vliegtuigen-l-lockheed-harpoon" },
  { name: "Lockheed Neptune P-2", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-l/vliegtuigen-l-lockheed-neptune", aliases: ["P-2 Neptune"] },
  { name: "Lockheed Orion P-3", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-l/vliegtuigen-l-lockheed-orion", aliases: ["P-3 Orion"] },
  { name: "Lockheed T-33", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-l/vliegtuigen-l-lockheed-t33" },
  { name: "LVG B.I", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-l/vliegtuigen-l-lvg-b1" },
  { name: "LVG B.II", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-l/vliegtuigen-l-lvg-b2" },
  { name: "LVG C.VI", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-l/vliegtuigen-l-lvg-c6" },

  // M
  { name: "Martin Type R", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-m/vliegtuigen-m-martin-r" },
  { name: "Martin Type S", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-m/vliegtuigen-m-martin-s" },
  { name: "Martin Type TA", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-m/vliegtuigen-m-martin-ta" },
  { name: "Martin Type TT", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-m/vliegtuigen-m-martin-tt" },
  { name: "Martin 139", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-m/vliegtuigen-m-martin-139", aliases: ["Glenn Martin"] },
  { name: "McDonnell Douglas AH-64 Apache", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-m/vliegtuigen-m-mcdon-apache", aliases: ["Boeing AH-64 Apache"] },
  { name: "McDonnell Douglas DC-10", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-m/vliegtuigen-m-mcdon-dc10", aliases: ["KDC-10"] },
  { name: "Messerschmitt Me-108B", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-m/vliegtuigen-m-messerschmitt-108" },
  { name: "Miles M.2H Hawk", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-m/vliegtuigen-m-miles-hawk" },
  { name: "Mitsubishi Ki.21 Sally", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-m/vliegtuigen-m-mitsubishi-ki21" },
  { name: "Mitsubishi Ki.57 Topsy", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-m/vliegtuigen-m-mitsubishi-ki57" },
  { name: "Morane Saulnier AR.35 EP2", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-m/vliegtuigen-m-morane-ar35" },

  // N
  { name: "NHI NH.90", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-n/vliegtuigen-n-nh90", aliases: ["NH90"] },
  { name: "Nieuport XI/XVII", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-n/vliegtuigen-n-nieuport-11-17", aliases: ["Nieuport 11", "Nieuport 17", "Nieuport C1"] },
  { name: "Nieuport XXI C1", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-n/vliegtuigen-n-nieuport-21", aliases: ["Nieuport 21"] },
  { name: "Nieuport XXIII C1", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-n/vliegtuigen-n-nieuport-23", aliases: ["Nieuport 23"] },
  { name: "Noorduyn Norseman", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-n/vliegtuigen-n-noorduyn-norseman" },
  { name: "North American B-25 Mitchell", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-n/vliegtuigen-n-northam-b25" },
  { name: "North American F-86K Sabre", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-n/vliegtuigen-n-northam-f86k", aliases: ["F-86 Kaasjager"] },
  { name: "North American P-51 Mustang", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-n/vliegtuigen-n-northam-p51" },
  { name: "Northrop NF-5", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-n/vliegtuigen-n-northrop-nf5", aliases: ["Canadair NF-5", "Freedom Fighter"] },
  { name: "Northrop Shellduck KD2R-5", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-n/vliegtuigen-n-northrop-shellduck" },

  // P
  { name: "Pander D", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-p/vliegtuigen-p-pander-d" },
  { name: "Percival Proctor", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-p/vliegtuigen-p-percival-proctor" },
  { name: "Pfalz D.IIIa", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-p/vliegtuigen-p-pfalz-d3a", aliases: ["Pfalz D.3a"] },
  { name: "Pilatus PC-7", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-p/vliegtuigen-p-pilatus-pc7" },
  { name: "Piper L-4/L-18C/L-21 SuperCub", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-p/vliegtuigen-p-piper-cub", aliases: ["Piper Cub"] },
  { name: "Porterfield 35-70", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-p/vliegtuigen-p-porterfield-35-70" },

  // R
  { name: "RAF Be-2c", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-r/vliegtuigen-r-arf-be2" },
  { name: "RAF SE-5a", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-r/vliegtuigen-r-arf-be2-2" },
  { name: "Republic F-84E/G Thunderjet", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-r/vliegtuigen-r-arf-be2-3", aliases: ["F-84 Thunderjet"] },
  { name: "Republic F-84F Thunderstreak", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-r/vliegtuigen-r-arf-be2-4" },
  { name: "Republic RF-84F Thunderflash", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-r/vliegtuigen-r-rep-thunderflash" },
  { name: "Robert-Esnault-Pelterie REP-2 Parasol", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-r/vliegtuigen-r-robert-rep" },
  { name: "Rumpler CI/C.Ia", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-r/vliegtuigen-r-rumpler-c1" },
  { name: "Rumpler C.IV", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-r/vliegtuigen-r-rumpler-c4", aliases: ["Rumpler C.4"] },
  { name: "Rumpler C.VI", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-r/vliegtuigen-r-rumpler-c6", aliases: ["Rumpler C.6"] },
  { name: "Rumpler C.VIII", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-r/vliegtuigen-r-rumpler-c8", aliases: ["Rumpler C.8"] },
  { name: "Ryan STM", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-r/vliegtuigen-r-ryan-stm" },

  // S
  { name: "Sagem Sperwer UAV", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-s/vliegtuigen-s-sagem-sperwer" },
  { name: "Sopwith Pup", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-s/vliegtuigen-s-sopwith-pup" },
  { name: "Sopwith 1 1/2 Strutter", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-s/vliegtuigen-s-sopwith-strutter", aliases: ["Hanriot Strutter"] },
  { name: "Spad S-7 C.1", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-s/vliegtuigen-s-spad-s7" },
  { name: "Spijker V1", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-s/vliegtuigen-s-spijker-v1" },
  { name: "Spijker V2", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-s/vliegtuigen-s-spijker-v2" },
  { name: "Sud Aviation Alouette II", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-s/vliegtuigen-s-sud-alouette-2", aliases: ["Alouette II"] },
  { name: "Sud Aviation Alouette III", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-s/vliegtuigen-s-sud-alouette-3", aliases: ["Alouette III"] },
  { name: "Supermarine Spitfire", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-s/vliegtuigen-s-spitfire" },

  // T
  { name: "Tachikawa Ki-54 Soren", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-t/vliegtuigen-t-tachikawa-soren" },
  { name: "Taylorcraft L-2", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-t/vliegtuigen-t-taylorcraft-l2" },
  { name: "Thulin K", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-t/vliegtuigen-t-thulin-k" },
  { name: "Thulin LA", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-t/vliegtuigen-t-thulin-la" },

  // V
  { name: "Vickers Sea Otter", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-v/vliegtuigen-v-vickers-seaotter", aliases: ["Supermarine Sea Otter"] },
  { name: "Vickers Viking", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-v/vliegtuigen-v-vickers-viking" },
  { name: "Voisin LA/LB", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-v/vliegtuigen-v-voisin-lb" },
  { name: "Vought OS2U-3 Kingfisher", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-v/vliegtuigen-v-vought-kingfisher" },
  { name: "Vultee BT-13 Valiant", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-v/vliegtuigen-v-vultee-valiant" },

  // W
  { name: "Waco EGC-7", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-w/vliegtuigen-w-waco-egc" },
  { name: "Waco UKC", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-w/vliegtuigen-w-waco-ukc" },
  { name: "Westland Lynx", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-w/vliegtuigen-w-westland-lynx", aliases: ["SH-14", "UH-14"] },
  { name: "Westland Wasp", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-w/vliegtuigen-w-westland-wasp" },
  { name: "White Thompson no.3", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-w/vliegtuigen-w-white-thompson-3" },

  // Y
  { name: "Yokosuka K5Y Willow", url: "/artikelen/nedmil-luchtvaart/vliegtuigen-y/vliegtuigen-y-yokosuka-willow" }
];

/**
 * Normalize aircraft name for matching
 * Removes dots, spaces, converts to lowercase for better matching
 */
function normalizeAircraftName(name: string): string {
  return name
    .toLowerCase()
    // Remove common prefixes/suffixes that vary
    .replace(/\b(mk|mark|type|model|no\.?)\s*/gi, '')
    // Normalize roman numerals to arabic numbers for better matching
    .replace(/\bxviii\b/g, '18')
    .replace(/\bxvii\b/g, '17')
    .replace(/\bxvi\b/g, '16')
    .replace(/\bxv\b/g, '15')
    .replace(/\bxiv\b/g, '14')
    .replace(/\bxiii\b/g, '13')
    .replace(/\bxii\b/g, '12')
    .replace(/\bxi\b/g, '11')
    .replace(/\bx\b/g, '10')
    .replace(/\bix\b/g, '9')
    .replace(/\bviii\b/g, '8')
    .replace(/\bvii\b/g, '7')
    .replace(/\bvi\b/g, '6')
    .replace(/\bv\b/g, '5')
    .replace(/\biv\b/g, '4')
    .replace(/\biii\b/g, '3')
    .replace(/\bii\b/g, '2')
    .replace(/\bi\b/g, '1')
    // Remove special characters and whitespace
    .replace(/\./g, '')
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/\//g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '');
}

/**
 * Calculate similarity score between two strings (0-1)
 */
function getSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  // Check if one contains the other
  if (longer.includes(shorter)) return 0.8;

  // Count common characters
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }

  return matches / longer.length;
}

/**
 * Find IPMS URL for a given aircraft name
 * @param {string} aircraftName - Name of the aircraft to search for
 * @returns {string|null} - Full IPMS URL or null if not found
 */
export function findAircraftUrl(aircraftName: string): string | null {
  const normalized = normalizeAircraftName(aircraftName);

  // 1. Try exact match in main names and aliases
  const exactMatch = AIRCRAFT_DATABASE.find(aircraft => {
    if (normalizeAircraftName(aircraft.name) === normalized) return true;

    if (aircraft.aliases) {
      return aircraft.aliases.some(alias =>
        normalizeAircraftName(alias) === normalized
      );
    }

    return false;
  });

  if (exactMatch) {
    return `https://www.ipms.nl${exactMatch.url}`;
  }

  // 2. Try partial/contains match
  const partialMatch = AIRCRAFT_DATABASE.find(aircraft => {
    const aircraftNorm = normalizeAircraftName(aircraft.name);

    // Check if one contains the other
    if (aircraftNorm.includes(normalized) || normalized.includes(aircraftNorm)) {
      return true;
    }

    // Check aliases too
    if (aircraft.aliases) {
      return aircraft.aliases.some(alias => {
        const aliasNorm = normalizeAircraftName(alias);
        return aliasNorm.includes(normalized) || normalized.includes(aliasNorm);
      });
    }

    return false;
  });

  if (partialMatch) {
    return `https://www.ipms.nl${partialMatch.url}`;
  }

  // 3. Try fuzzy match (similarity score > 0.6)
  let bestMatch: AircraftEntry | null = null;
  let bestScore = 0.6; // Minimum threshold

  AIRCRAFT_DATABASE.forEach(aircraft => {
    const score = getSimilarity(normalizeAircraftName(aircraft.name), normalized);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = aircraft;
    }

    // Also check aliases
    if (aircraft.aliases) {
      aircraft.aliases.forEach(alias => {
        const aliasScore = getSimilarity(normalizeAircraftName(alias), normalized);
        if (aliasScore > bestScore) {
          bestScore = aliasScore;
          bestMatch = aircraft;
        }
      });
    }
  });

  if (bestMatch !== null) {
    const match: AircraftEntry = bestMatch;
    console.log(`Fuzzy match for "${aircraftName}": "${match.name}" (score: ${bestScore.toFixed(2)})`);
    return `https://www.ipms.nl${match.url}`;
  }

  return null;
}

interface SearchResult {
  name: string;
  url: string;
  aliases: string[];
}

/**
 * Search for aircraft by partial name
 * @param {string} searchTerm - Search term
 * @returns {Array} - Array of matching aircraft with their URLs
 */
export function searchAircraft(searchTerm: string): SearchResult[] {
  const normalized = normalizeAircraftName(searchTerm);

  return AIRCRAFT_DATABASE
    .filter((aircraft): aircraft is AircraftEntry => {
      const nameMatch = normalizeAircraftName(aircraft.name).includes(normalized);
      const aliasMatch = aircraft.aliases ? aircraft.aliases.some(alias =>
        normalizeAircraftName(alias).includes(normalized)
      ) : false;
      return nameMatch || aliasMatch;
    })
    .map((aircraft): SearchResult => ({
      name: aircraft.name,
      url: `https://www.ipms.nl${aircraft.url}`,
      aliases: aircraft.aliases || []
    }));
}

/**
 * Get IPMS search URL for any aircraft name
 * @param {string} aircraftName - Name of the aircraft
 * @returns {string} - IPMS search URL
 */
export function getIPMSSearchUrl(aircraftName: string): string {
  return `https://www.ipms.nl/zoeken?searchword=${encodeURIComponent(aircraftName)}`;
}

/**
 * Example usage in your React component:
 * 
 * import { findAircraftUrl, searchAircraft } from './ipms-reference.js';
 * 
 * // Direct URL lookup
 * const url = findAircraftUrl("Fokker G.1");
 * if (url) {
 *   window.open(url, '_blank');
 * }
 * 
 * // Search for aircraft
 * const results = searchAircraft("spitfire");
 * console.log(results); // [{ name: "Supermarine Spitfire", url: "...", aliases: [] }]
 * 
 * // Get all Fokker aircraft
 * const fokkers = searchAircraft("fokker");
 */