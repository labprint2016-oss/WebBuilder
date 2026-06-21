import { useState, useEffect, useRef } from "react";
import { Paper, Button,Checkbox,Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { listPosts } from "../../Functions/post";
import { head, includes } from "lodash";
import { AlignCenter, Copy, FilePenLine, FileXCorner } from "lucide-react";
import { deletePost } from "../../Functions/post";

const PostData = ({copy,setIsEditPost,setPostID}) => {
  const [posts, setPosts] = useState([]);


  



  


  const [deleteID,setDeleteID] = useState([]);

  function setRowData() {
    const newRows = [];
    posts.forEach((post, index) => {
      const newRow = {};
      newRow.image = post.image;
      newRow.title = post.title.text;
      newRow.category = post.category;
      newRow.id = post._id;
      newRows.push(newRow);
    });
    return newRows;
  }

  const [rows, setRows] = useState(setRowData());


  const loadPosts = () => {
    listPosts()
      .then((res) => {
        setPosts(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };


  useEffect(()=>{
    console.log(deleteID);
  },[deleteID])




  

  useEffect(() => {
    loadPosts();
  }, []);


  useEffect(() => {
    setRows(setRowData());
  }, [posts]);

  const btns = [{key:"copy",Icon:Copy,def:copy}, {key:"edit",Icon:FilePenLine,def:(id)=>{
   setIsEditPost(true);
   setPostID(id);
  }}];

  const columns = [
    {
      field: "_select",
      headerName: "",
      width: 100,
      renderCell: (params) => {
        return (
          <Checkbox checked={deleteID.includes(params.row.id)} onChange={(e) => {
            const {id} = params.row
            let newDeleteID = [...deleteID]
            if(e.target.checked){
              newDeleteID.push(id)
            }else{
              newDeleteID = newDeleteID.filter(x => x !== id)
            }
            setDeleteID(newDeleteID)
          }}/>
        );
      },
      renderHeader:()=>{
        return (
          <Checkbox checked={deleteID.length === rows.length} onChange={(e) => {
            if (e.target.checked) {
              // เลือกทั้งหมด
              setDeleteID(rows.map(r => r.id));
            } else {
              // เอาออกทั้งหมด
              setDeleteID([]);
            }
          }}/>
         );
      }
    },
    {
      field: "image",
      headerAlign: "center",
      headerName: "รูปภาพ",
      width: 120,
      renderCell: (params) => {
        return (
          <div className="flex items-center justify-center">
            <img
              src={`http://localhost:5000/${params.value}`}
              style={{ borderRadius: "100%", width: 50, height: 50,margin:"10px 0px",objectFit: "cover", }}
            />
          </div>
        );
      },
    },
    { field: "title", headerName: "หัวข้อ", width: 440  },
    { field: "category", headerName: "หมวดหมู่", width: 560 },
    {
      field: "manage",
      headerName: "จัดการ",
      align:"center",
      headerAlign: "center",
      width: 314,
      renderCell: (params) => {
        return (
          <Box sx={{
            position:"relative", width: "100%", height: "100%" 
          }}>
               <Box  sx={{
                position:"absolute",
                left:"70%",
                top:"0%",
            width: "max-content",
            transform: "translate(-50%, 0%)",
          }}>
              <div className="grid grid-cols-3 gap-0 mt-[16px]">
            {btns.map((btn) => {
              const {Icon,def,key} = btn;
              return (
                <div key={key} className={`col-span-1 flex items-center justify-center ${key === "copy"?"border-r-indigo-300 border-r  border-dashed":"" }`}>
                  <div
                    className={`h-[35px] pl-8`}
                  >
                    <Button sx={{backgroundColor:"transparent",minWidth:5,marginRight:5,marginBottom:20}} onClick={async (e)=>{
                      if(key === "copy"){
                        const clonePost = posts.find(p => p._id === params.row.id)
                        await def(e,clonePost)
                        await loadPosts()
                      }
                      else{
                        def(params.row.id)
                      }

                    }}>
                      <Icon className="text-black"/>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          </Box>
          </Box>
         
        
        );
      },
    },
  ];


  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 13 });

  return (
    <main
      className="content-area flex-1 overflow-y-auto p-4 sm:p-6 "
      area="main"
    >

      {deleteID.length ? (
        <Button onClick={(e)=>{
          e.preventDefault()
          deletePost(deleteID)
          .then(res=>{
            loadPosts()
            setDeleteID([])
            console.log(res.data);
          }
            
          )
          .catch(err=>console.log(err))
          
        }}>Delete</Button>
      ):(
        <></>
      )}

      <div className="min-h-[600px] rounded-xl border border-white/10 bg-white/5">
        <div className="mx-auto relative z-10 w-full">
          <Paper sx={{ width: "100%"}}>
            <DataGrid
              rows={rows ?? []}
              getRowId={(row)=>row.id}
              columns={columns}
              pagination
              sx={{
                "& .MuiDataGrid-virtualScroller":{
                  maxHeight:1000,
                  overflowY:"auto"
                }
              }}
              rowHeight={70}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[13]} 
              slotProps={{ pagination: { rowsPerPageOptions: [13] } }}
            />
          </Paper>
    
        </div>
      </div>
    </main>
  );
};

export default PostData;
