import { DialogHeader, DialogTitle, DialogDescription, DialogContent } from '@/components/ui/dialog';
import { ReporteTransaccion } from '@/types/ProcessTransaccion';
import { URL_API_DATA } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth/AuthProvider';
import { Card, CardContent } from './ui/card';
import { useEffect, useState } from 'react';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { Loading } from './ui/loading';

interface PropsDialog {
  funClose: (openDialog: boolean) => void;
  funReload: () => void;
  idTrans: number;
}

function LazyDialogContent({ funClose, funReload, idTrans }: PropsDialog) {
  const [reporte, setReporte] = useState<ReporteTransaccion | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const [nota, setNota] = useState('')

  const handleClickAprobar = (ev: React.FormEvent) => {
    // here logic to approve the transaction
    ev.preventDefault()
    if (!window.confirm('¿Estás seguro de aprobar esta transacción?')) {
      return;
    }
    setLoading(true)

    if (!nota) {
      toast.error('Por favor, completa el campo observación')
      setLoading(false)
      return
    }

    axios.put(`${URL_API_DATA}/aprobar`, { id: idTrans, nota: nota, auth: user?.document })
      .then(res => {
        console.log(res)
        if (res.status === 200) {
          toast.success('Transacción Aprobada Exitosamente')
          funClose(false)
          funReload()
          setNota('')
        }
      })
      .catch(err => {
        console.log(err);
        toast.error('Error al aprobar la transacción', { description: 'Por favor, intenta de nuevo' })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleClickRechazar = (ev: React.FormEvent) => {
    // here logic to reject the transaction
    ev.preventDefault()
    if (!window.confirm('¿Estás seguro de rechazar esta transacción?')) {
      return;
    }
    setLoading(true)

    if (!nota) {
      toast.error('Por favor, completa el campo observación')
      setLoading(false)
      return
    }

    axios.put(`${URL_API_DATA}/rechazar`, { id: idTrans, nota: nota, auth: user?.document })
      .then(res => {
        console.log(res)
        if (res.status === 200) {
          toast.success('Transacción Rechazada Exitosamente')
          funClose(false)
          funReload()
          setNota('')
        }
      })
      .catch(err => {
        console.log(err);
        toast.error('Error al rechazar la transacción', { description: 'Por favor, intenta de nuevo' })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    axios.get<ReporteTransaccion>(`${URL_API_DATA}/reporte/${idTrans}`)
      .then(res => {
        setReporte(res.data)
      })
      .catch(err => {
        console.log(err)
      })
  }, [idTrans])

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Procesar Transacción</DialogTitle>
        <DialogDescription className='flex justify-between gap-2'>
          <span>Verificación de datos para la transacción con ID:</span> <Badge variant='default' className='px-4'>{idTrans}</Badge>
        </DialogDescription>
      </DialogHeader>
      <Card>

        <h1 className='text-center text-xl font-bold'>
          Información Premio Reportado
        </h1>

        <CardContent className='grid grid-cols-2 gap-2'>
          <p className='col-span-2'>Fecha | Hora Reporte: <span className='font-semibold'>{reporte?.FECHACREATE}</span> </p>
          <p>Concepto: {reporte?.CONCEPTO}</p>
          <p>Estado:
            <Badge variant={
              reporte?.ESTADO === 'APROBADO'
                ? 'success'
                : reporte?.ESTADO === 'RECHAZADO'
                  ? 'destructive'
                  : 'outline'
            }>
              {reporte?.ESTADO}
            </Badge>
          </p>
          <p>Maquina: <Badge variant='default'>{reporte?.TERCERO}</Badge></p>
          <p>Valor Premio: <Badge variant='secondary'> $ {Intl.NumberFormat('es-CO').format(reporte?.VALOR || 0)}</Badge></p>
        </CardContent>
      </Card>

      <Card>

        <h1 className='text-center text-xl font-bold'>
          Información Punto Vendedor
        </h1>

        <CardContent className='grid grid-cols-2 gap-2'>
          <p className='col-span-2'>Vendedora: <span className='underline font-semibold'>{reporte?.Vendedore.NOMBRES}</span></p>
          <p>Documento: {reporte?.Vendedore.DOCUMENTO}</p>
          <p>N° Sucursal: {reporte?.SUCURSAL}</p>
          <p className='col-span-2'>Nombre Sucursal: {reporte?.Sucursale.NOMBRE}</p>
          <p>Empresa: <Badge variant='secondary'>{reporte?.Sucursale.ZONA === '39627' ? 'Multired' : 'Servired'}</Badge></p>
        </CardContent>
      </Card>

      <Card>
        <h1 className='text-center text-xl font-bold'>Transacciones</h1>

        <CardContent className=''>
          <form className='flex flex-col gap-2'>
            <article className='px-4'>
              <Textarea
                placeholder='Nota | Observación'
                required
                value={nota}
                onChange={(e) => setNota(e.target.value)}
              />
            </article>
            <div className='flex justify-between gap-2'>
              <Button
                onClick={handleClickRechazar}
                disabled={loading}
                type='submit'
                variant='destructive'>
                Rechazar Transacción
              </Button>
              <Button
                onClick={handleClickAprobar}
                disabled={loading}
                type='submit'
                variant='success'>
                Aprobar Transacción
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {
        loading && (
          <div className='absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50'>
            <Loading />
          </div>
        )
      }
    </DialogContent>
  )
}

export default LazyDialogContent;