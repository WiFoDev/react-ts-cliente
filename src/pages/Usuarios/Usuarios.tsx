import React, { useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, InputAdornment } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { UsuarioWithId, Usuario } from '@/types';

import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { findAll, APIError, createOne, updateOne, deleteOne } from '@/pages/Usuarios/api';

export default function Usuarios() {

    const queryClient = useQueryClient();
    const [newUsuario, setNewUsuario] = useState({ _id: '', name: '', identification: '', email: '' });   
    
    // Forma adecuada cuando se tiene un estado anterior mas reciente.
    const handleChange = (e: { target: { name: any; value: any; }; }) => setNewUsuario(prevState => ({ ...prevState, [e.target.name]: e.target.value }));

    const [openModal, setOpenModal] = useState(false);
    const [openModalEliminar, setOpenModalEliminar] = useState({ openModal: false, id: '' });
    
    const [edit, setEdit] = useState(false);
    
    const handleClose = () => { setOpenModal(false); setEdit(false); };
    const handleCloseC = () => { setOpenModalEliminar({ openModal: false, id: '' }) };

    const { data, isLoading, isFetching } = useQuery<UsuarioWithId[], APIError>(['findAll'], () => findAll());

    const { mutateAsync } = useMutation<UsuarioWithId, APIError, Usuario>((_user) => createOne(_user), {
        onSuccess() {
            queryClient.invalidateQueries(['findAll']);
        },
    });

    const deleteOneMutation = useMutation((id: string) => deleteOne(id), {
        onSuccess() {
            queryClient.invalidateQueries(['findAll']);
        },
    });

    const updateOneMutation = useMutation(
        (newUsuario: UsuarioWithId) =>
            updateOne(newUsuario._id.toString(), {
                name: newUsuario.name,
                identification: newUsuario.identification,
                email: newUsuario.email
            }),
        {
            onSuccess() {
                queryClient.invalidateQueries(['findAll']);
                setOpenModal(false);
            },
        }
    );

    const formSubmitted = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!newUsuario) return;
        if (edit === true) {
            updateOneMutation.mutate(newUsuario);
        } else {
            await mutateAsync({
                name: newUsuario.name,
                identification: newUsuario.identification,
                email: newUsuario.email,
            });
            setNewUsuario({ _id: '', name: '', identification: '', email: '' });
        }
    };

    const handleClickModal = (editMode: boolean, row: any) => {
        setOpenModal(true);
        setEdit(editMode);
        if (editMode === true) {
            setNewUsuario({ _id: row._id, name: row.name, identification: row.identification, email: row.email });
        } else {
            setNewUsuario({ _id: '', name: '', identification: '', email: '' });
        }
    }

    const handleModal_DelConfirm = (id: string) => {
        setOpenModalEliminar({ openModal: true, id: id });
    }

    return (
        <>
            <Button variant="outlined" onClick={() => handleClickModal(false, null)} sx={{ marginBottom: '2rem', float: 'right' }} >
                Nuevo Usuario
            </Button>
            {/* TODO: Componetizar modal de confirmar borrado, con custom props. */}
            <Dialog open={openModalEliminar.openModal} onClose={handleCloseC} maxWidth="xs">
                <DialogTitle id="alert-dialog-title">
                    ELIMINAR
                </DialogTitle>
                <DialogContent>
                    <DialogContentText >
                        ¿Estas seguro de eliminar el usuario?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseC}>No</Button>
                    <Button onClick={() => { deleteOneMutation.mutate(openModalEliminar.id) }}>Si</Button>
                </DialogActions>
            </Dialog>

            {/* TODO: Componetizar dialog de creacion y actualizacion, con custom props. */}
            <Dialog open={openModal} onClose={handleClose} fullWidth={true}>
                <DialogTitle>Creacion del Usuario</DialogTitle>
                <form onSubmit={formSubmitted}>
                    <DialogContent>
                        <DialogContentText>
                            Favor ingresar los datos básicos del usuario.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            value={newUsuario.name}
                            onChange={handleChange}
                            margin="dense"
                            id="name"
                            name="name"
                            label="Nombre Completo"
                            type="text"
                            fullWidth
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><PersonIcon></PersonIcon></InputAdornment>,
                            }}
                        />
                        <TextField
                            autoFocus
                            value={newUsuario.identification}
                            onChange={handleChange}
                            margin="dense"
                            id="identification"
                            name="identification"
                            label="No. Identificación"
                            type="text"
                            fullWidth
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><BadgeIcon></BadgeIcon></InputAdornment>,
                            }}
                        />
                        <TextField
                            autoFocus
                            value={newUsuario.email}
                            onChange={handleChange}
                            margin="dense"
                            id="email"
                            name="email"
                            label="Correo Electrónico"
                            type="email"
                            fullWidth
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><EmailIcon></EmailIcon></InputAdornment>,
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancelar</Button>
                        <LoadingButton type="submit">Aceptar</LoadingButton>
                    </DialogActions>
                </form>
            </Dialog>
            {!(isLoading || isFetching) &&
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre Completo</TableCell>
                                <TableCell>No. Identificación</TableCell>
                                <TableCell>Correo Electrónico</TableCell>
                                <TableCell align="right">Opciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data?.map((row) => (
                                <TableRow
                                    key={row._id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.identification}</TableCell>
                                    <TableCell>{row.email}</TableCell>
                                    <TableCell align="right">
                                        <EditIcon sx={{ color: 'green', padding: '2px', cursor: 'pointer' }} onClick={() => handleClickModal(true, row)}></EditIcon>
                                        <DeleteIcon sx={{ color: 'red', padding: '2px', cursor: 'pointer' }} onClick={() => { handleModal_DelConfirm(row._id) }}></DeleteIcon>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            }
        </>
    );
}
