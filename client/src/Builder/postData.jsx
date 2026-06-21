import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TableSortLabel, Toolbar, Typography, Checkbox, IconButton,
  Tooltip, TablePagination, Avatar, Stack, Button,TextField,InputAdornment,Fade,Modal,Backdrop
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Copy, FilePenLine, FileXCorner,CircleX,CirclePlus} from "lucide-react";
import { listPosts, deletePost } from "../../Functions/post";
import { BrowserRouter, Route, Routes, Navigate, useLocation, useNavigate, matchPath, useParams } from "react-router-dom"


const headCells = [
  {
    id: 'image',
    numeric: false,
    disablePadding: false,
    label: 'รูปภาพ',
  },
  {
    id: 'title',
    numeric: true,
    disablePadding: false,
    label: 'หัวข้อ',
  },
  {
    id: 'category',
    numeric: true,
    disablePadding: false,
    label: 'หมวดหมู่',
  },
  {
    id: 'manage',
    numeric: true,
    disablePadding: false,
    label: 'จัดการ',
  },
];

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
    props;


  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => {
  const isSortable = !["image", "manage"].includes(headCell.id);
  return (
    <TableCell
      key={headCell.id}
      align={headCell.id === "image" || headCell.id === "manage" ? "center" : "left"}
      padding={headCell.id === "image" ? "none" : (headCell.disablePadding ? "none" : "normal")}
      sortDirection={orderBy === headCell.id ? order : false}
    >
      {isSortable ? (
        <TableSortLabel
          active={orderBy === headCell.id}
          direction={orderBy === headCell.id ? order : "asc"}
        >
          {headCell.label}
          {orderBy === headCell.id ? (
            <Box component="span" sx={visuallyHidden}>
              {order === "desc" ? "sorted descending" : "sorted ascending"}
            </Box>
          ) : null}
        </TableSortLabel>
      ) : (
        headCell.label   // ← รูปภาพ/จัดการ ใช้ข้อความตรง ๆ
      )}
    </TableCell>
  );
})}

      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};


export default function EnhancedTable({copy,setIsEditPost,setPostID,setOption,setIsAddPost,setNavOpen}) {
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
  setNavOpen(true)
 setOption("editPost")
 setPostID(id);
 navigate(`/editPost/${id}`)

}}];
  const [order, setOrder] = React.useState('asc');
  const [openMd,setOpenMd] = useState(false)
  const [orderBy, setOrderBy] = React.useState('calories');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [filter,setFilter] = useState("")
  const [filterRows,setFilterRow] = useState(rows)
  useEffect(()=>{
    const lower = filter.trim().toLowerCase()
    setFilterRow(prev=>{
      return rows.filter(row=>{
        const lowerTitle = row.title.toLowerCase()
        return lowerTitle.includes(lower)
      })
    })
  },[filter,posts,rows])
  

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const selectToDeleteAllPosts = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setDeleteID(newSelected);
      return;
    }
    setDeleteID([]);
  };

  const selectToDeletePost = (id)=>{

    if(typeof id === "string"){
      if(deleteID.includes(id)){
        setDeleteID(prev=>{
          return prev.filter(_id => _id !== id)
        })
      }else{
        setDeleteID(prev=>{
          return [...prev,id]
        })
      }
    }else return
  }


 

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const navigate = useNavigate()



  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;


    function ConfirmModal({}) {
  
  
      const [open, setOpen] = useState(true);

      if (!open) setTimeout(() => setOpenMd(false), 200);
  
      return (
        <Modal
          open={open}
          onClose={(_, resson) => {
            setOpen(false);
          }}
          aria-labelledby="basic-modal-title"
          aria-describedby="basic-modal-desc"
          slotProps={{ backdrop: { timeout: 200 } }}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
        >
          <Fade in={open} timeout={200} onExited={close}>
            <Box
              sx={{
                position: "relative",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 400,
                height: "auto",
                backgroundColor: "white",
                borderRadius: 3,
              }}
              container={document.getElementById("app-root")}
            >
              <div className="flex justify-between px-4 pt-3 pb-1">
                <div className="text-[15px] font-bold">
                  <span className="text-red-600 dark:text-emerald-300">
                    ลบข้อมูล
                    </span>{" "}
                </div>
                <div>
                  <a onClick={() => setOpen(false)} style={{ cursor: "pointer" }}>
                    X
                  </a>
                </div>
              </div>
              <div
                className={`border-b border-dotted border-gray-500/50 flex-1`}
              ></div>
              <div className="flex justify-center mt-4 text-[13px] ">
              คุณต้องการลบข้อมูลนี้ใช่หรือไม่?
              </div>
  
              <div className="flex justify-center my-4 pb-5">
                <Button
                  sx={{
                    backgroundColor: "#B91C1C",
                    color: "white",
                    fontSize: 13,
                    fontWeight: "normal",
                    height: 25,
                    padding: "15px 12px",
                    marginRight: 1,
                  }}
                  onClick={() => {
                    setTimeout(() => {
                       deletePost(deleteID)
          .then(res=>{
            loadPosts()
            setDeleteID([])
            console.log(res.data);
          }
            
          )
          .catch(err=>console.log(err))
                    }, 200);
                    setOpen(false);
                  }}
                >
                  ใช่... ฉันต้องการลบ
                </Button>
                <Button
                  sx={{
                    backgroundColor: "#333",
                    color: "white",
                    fontSize: 13,
                    fontWeight: "normal",
                    height: 25,
                    padding: "15px 12px",
                    marginLeft: 1,
                  }}
                  onClick={() => setOpen(false)}
                >
                  ยกเลิก
                </Button>
              </div>
            </Box>
          </Fade>
        </Modal>
      );
    }


  return (
    <main
    className="content-area flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6 "
    area="main"
  >
    <div className="min-h-[600px] rounded-xl border border-white/10 bg-white/5">
      <div className="mx-auto relative z-10 w-full">
        <div className="flex items-center mb-[10px]">
        <Box sx={{width:"280px",display:"flex"}}>
        <Button onClick={()=>{
            setOption("AddPost")
            setNavOpen(true)
            navigate("/newPost")
          }} sx={{
            backgroundColor:"black",
            color:"white",
          fontSize:13,
          fontWeight:100,
          minWidth:120,
          }}><CirclePlus size={16} className="mr-[5px]"/>เพิ่มข้อมูล</Button>
        </Box>
     
        {deleteID.length > 0 && (

      <Box sx={{width:"100%",display:"flex",justifyContent:"flex-start"}}>
        <Button onClick={(e)=>{
          e.preventDefault()
          setOpenMd(true)
        
          
        }} sx={{
          backgroundColor:"#ce0606",
          color:"white",
          fontSize:13,
          fontWeight:100,
          minWidth:120,
        }}>
          <CircleX size={16} className="mr-[5px]"/>
          ลบข้อมูล {`(${deleteID.length})`}
        </Button>
      
      </Box>
    )}
    {rows.length > 1 && (
       <Box sx={{width:"100%",display:"flex",justifyContent:"flex-end"}}>
      <TextField  label="ค้นหา" onChange={(e)=>{
        setFilter(e.target.value)
      }} value={filter} 
      slotProps={{
        input: {
          sx: { fontSize: 15 },
          startAdornment: (
            <InputAdornment position="start"></InputAdornment>
          ),
        },
      }}
      sx={{
        "& .MuiInputLabel-root": { fontSize: 14, color: "#aaaaaa" },
        "& .MuiInputLabel-root.Mui-focused, \
           & .MuiInputLabel-root.Mui-error, \
           & .MuiInputLabel-root.Mui-disabled": {
          color: "#aaaaaa",
        },
        "& .MuiFormLabel-asterisk": { color: "#aaaaaa" },
      
        "& .MuiOutlinedInput-input": { fontSize: 15,height:8,width:200},
      
        "& .MuiInputLabel-root.MuiInputLabel-shrink": {
          transform: "translate(14px, -12px) scale(1)",
        },

      
        "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgba(0,0,0,0.23)", borderWidth: "1px",
        },
        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgba(0,0,0,0.23)", borderWidth: "1px",
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgba(0,0,0,0.23)", borderWidth: "1px",
        },
        "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgba(0,0,0,0.23)",
        },
      }}/>
     </Box>
    )}
        </div>
    
    
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table
            sx={{ minWidth: 750, tableLayout: 'fixed' }} 
            aria-labelledby="tableTitle"
            size={'medium'}
          >
               <colgroup>
      <col style={{ width: 56,minWidth:56 }} />   
      <col style={{ width: 120,minWidth:120 }} />   
      <col style={{ width: 600,minWidth:600}} />
      <col style={{ width: 300,minWidth:300 }} />  
      <col style={{ width: 160,minWidth:160 }} /> 
    </colgroup>
            <EnhancedTableHead
              numSelected={deleteID.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={selectToDeleteAllPosts}
              onRequestSort={handleRequestSort}
              rowCount={filterRows.length}
            />
            <TableBody>
              {filterRows.map((row, index) => {
                const isItemSelected = deleteID.includes(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onChange={()=>{
                          selectToDeletePost(row.id)
                        }}
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                      />
                    </TableCell>
                    <TableCell padding="none">
  <Box sx={{ display: "flex", justifyContent: "center" }}>
    <img
      src={row.image}
      style={{
        display: "block",
        borderRadius: "100%",
        width: 50,
        height: 50,
        margin: "10px 0",
        objectFit: "cover",
      }}
    />
  </Box>
</TableCell>
                    <TableCell align="left" >{row.title}</TableCell>
                    <TableCell align="left" >{row.category}</TableCell>
                    <TableCell align="left" >  
              <div className="grid grid-cols-2">
            {btns.map((btn) => {
              const {Icon,def,key} = btn;
              return (
                <div key={key} className={`col-span-1 flex items-center justify-center ${key === "copy"?"border-r-indigo-300 border-r border-dashed":"" }`}>
                  <div
                    className={`h-[35px]`}
                  >
                    <Button sx={{backgroundColor:"transparent",minWidth:5,marginBottom:20}} onClick={async (e)=>{
                      if(key === "copy"){
                        const clonePost = posts.find(p => p._id === row.id)
                        await def(e,clonePost)
                        await loadPosts()
                      }
                      else{
                        
                        def(row.id)
                      }

                    }}>
                      <Icon className="text-black"/>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
         </TableCell>

                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}

          labelRowsPerPage="จำนวนข้อมูลต่อหน้า :"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
            }
            getItemAriaLabel={(type) =>
              ({
                first: 'หน้าแรก',
                last: 'หน้าสุดท้าย',
                next: 'หน้าถัดไป',
                previous: 'หน้าก่อนหน้า',
              }[type])
            }
        />
      </Paper>
              </div>
              </div>
              {openMd && (
                <ConfirmModal/>
              )}
              
      </main>
    
  );
}
