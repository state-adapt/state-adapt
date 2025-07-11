// export type ItemDef = string;

// export type SectionDef = {
//   name: string;
//   items: ItemDef[]
// }

export type Item = {
  params: { symbol: string };
  def: {
    symbol: string;
    path: string;
    link: string;
    section: string;
  };
};

export type Section = {
  name: string;
  items: Item[];
};
