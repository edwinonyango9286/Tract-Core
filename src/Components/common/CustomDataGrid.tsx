import { DataGrid, type GridColDef, type GridRowsProp, type GridPaginationModel, type GridRowId } from "@mui/x-data-grid";
import NoRowsOverlay from "./NoRowsOverlay";

interface CustomDataGridProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  rowCount: number;
  loading: boolean;
  getRowId?: (row: GridRowsProp[number]) => GridRowId;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  pageSizeOptions?: number[];
}

const CustomDataGrid: React.FC<CustomDataGridProps> = ({ columns, rows, rowCount,loading,getRowId, paginationModel, onPaginationModelChange,pageSizeOptions = [10, 20, 50, 100]}) => {
  return (
    <DataGrid
      columns={columns}
      slots={{ noRowsOverlay: NoRowsOverlay }}
      rows={rows}
      rowCount={rowCount}
      loading={loading}
      getRowId={getRowId}
      pageSizeOptions={pageSizeOptions}
      paginationMode="server"
      pagination
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      sx={{
        borderRadius: "12px",
        "& .MuiDataGrid-columnHeaderTitle": {
          fontWeight: "700",
          fontSize: "14px",
        },
           "& .MuiDataGrid-columnHeader": {
          backgroundColor: "#E5E7EB", 
        },
      }}
    />
  );
};

export default CustomDataGrid;