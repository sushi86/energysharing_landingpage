export type OrtsteilGroup = {
  label: string;
  items: string[];
};

export const ORTSTEIL_GROUPS: OrtsteilGroup[] = [
  {
    label: "Niedenstein",
    items: ["Niedenstein (Kernstadt)", "Metze", "Wichdorf", "Kirchberg", "Ermetheis"],
  },
  {
    label: "Edermünde",
    items: ["Besse", "Grifte", "Haldorf", "Holzhausen"],
  },
  {
    label: "Gudensberg",
    items: [
      "Gudensberg (Kernstadt)",
      "Deute",
      "Dissen",
      "Dorla",
      "Gleichen",
      "Maden",
      "Obervorschütz",
    ],
  },
];

export const OTHER_OPTION = "Anderer Ort im EAM-Gebiet (Nordhessen)";

export const ALL_ORTSTEIL_VALUES: readonly string[] = [
  ...ORTSTEIL_GROUPS.flatMap((g) => g.items),
  OTHER_OPTION,
] as const;
