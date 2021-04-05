enum Property {
  City = 'CITY',
  Owner = 'OWNER',
  Model = 'MODEL',
  Status = 'STATUS',
}

export interface Filter {
  property: Property;
  name: string;
  selectedOptions: [];
}
