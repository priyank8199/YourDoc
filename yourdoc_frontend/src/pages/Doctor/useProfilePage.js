import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DateTime } from "luxon";
import jwtDecode from "jwt-decode";
import { useAppointment } from "../../hooks/useAppointment";
import { useCookies } from "react-cookie";
import { useAvailablitiy } from "../../hooks/useAvailability";
import { ToastContext } from "../../contexts/contexts";

export const Fields = [
  { type: 'time', placeholder: 'Monday', id: 'mon', isRequired: true },
  { type: 'time', placeholder: 'Tuesday', id: 'tue', isRequired: true },
  { type: 'time', placeholder: 'Wednesday', id: 'wed', isRequired: true },
  { type: 'time', placeholder: 'Thursday', id: 'thu', isRequired: true },
  { type: 'time', placeholder: 'Friday', id: 'fri', isRequired: true },
  { type: 'time', placeholder: 'Saturday', id: 'sat', isRequired: true },
  { type: 'time', placeholder: 'Sunday', id: 'sun', isRequired: true },
]

export function useProfilePage() {
  const [isShowModal, setIsShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState();
  const { getAppointmentsByDoctorId, deleteAppointment } = useAppointment();
  const { setAvailability, getAvailability } = useAvailablitiy();
  const [availState, setAvailState] = useState('isInit');
  const [defaultValues, setDefaultValues] = useState();
  const { showToastFor5s } = useContext(ToastContext);

  let user;
  const [listData, setListData] = useState();
  const [cookie] = useCookies(["session"]);
  const navigate = useNavigate();
  try {
    user = jwtDecode(cookie.session);
  } catch { }

  useEffect(() => {
    if (!user?.type) {
      navigate('/');
    }
  }, [user])

  useEffect(() => {
    getDoctorAppointments();
    getDoctorAvailability();
  }, []);

  const getDoctorAppointments = async () => {
    const doctorAppointments = await getAppointmentsByDoctorId(user.id);
    const listData = doctorAppointments.map(da => {
      const rightText = DateTime.fromISO(da.appointmentDateTime).toFormat('dd-MM-yyyy hh:mm a')
      const right = <button onClick={async (e) => {
        e.stopPropagation();
        const delAppointment = window.confirm('Do you want to delete appointment on ' + rightText + '?');
        if (delAppointment) {
          await deleteAppointment(da.aId);
          showToastFor5s({ toastText: 'Successfully deleted the appointment of ' + rightText + '.', toastTitle: 'Appointment deleted!', toastType: 'success' });
          setListData(listData.filter(l => l.aId !== da.aId));
        }
      }}>Delete</button>
      return ({
        aId: da.aId,
        title: da.patient_name,
        subSubTitle: da.gender + ', Ph: ' + (da.phone || '-') + ', Email: ' + (da.email || '-'),
        subTitle: rightText,
        rightText: right,
        onItemClick: async (e) => {
          if (e.currentTarget.tagName.toLowerCase() === 'button') {
            return;
          }
          setSelectedPatient(da.patient_id);
          setIsShowModal(true);
        }
      })
    })
    setListData(listData);
  };

  const getDoctorAvailability = async () => {
    const { data } = await getAvailability(user.id);
    const defaults = data?.reduce((p, c) => ({ ...p, [c.day]: c }), {});
    const defaultValue = { from_time: '09:00', to_time: '17:00' };
    Fields.forEach(f => {
      if (!defaults[f.id]) {
        defaults[f.id] = defaultValue
      }
    })
    setDefaultValues(defaults || {});
  }

  const onSetAvailability = async (e) => {
    e.preventDefault();
    const formElem = e.target;
    const availabilities = Fields.map(f => ({
      day: f.id,
      from_time: formElem[f.id].value,
      to_time: formElem[f.id + '_to'].value
    }));
    const isInvalidTime = !!availabilities.find(a => a.from_time > a.to_time);
    if (isInvalidTime) {
      showToastFor5s({ toastText: 'Invalid Selected Time', toastTitle: 'Invalid', toastType: 'danger' })
    } else {
      setAvailState('isLoading');
      await setAvailability({ doctor_id: user.id, availabilities });
      setAvailState('isSuccess');
    }
  }

  const onCloseModal = () => {
    setIsShowModal(false);
  }

  return { user, listData, onSetAvailability, availState, defaultValues, selectedPatient, isShowModal, onCloseModal }

}