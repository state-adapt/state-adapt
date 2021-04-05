export interface DashboardPreview {
  id: string;
  title: string;
  lastModified: string;
  thumbnail: string;
}
// const example: DashboardPreview = {
//   id: 'b22ec3ef-c12f-4bd5-acbc-fc7391650845',
//   title: 'test',
//   lastModified: '2021-02-25T17:02:06.351Z',
//   thumbnail: '',
// }

// /dashboards
export type DashboardsResponse = DashboardPreview[];

// /dashboards/b22ec3ef-c12f-4bd5-acbc-fc7391650845/can-edit
// boolean
