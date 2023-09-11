import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContext } from "../../contexts/contexts";
import { useUser } from "../../hooks/useUser";

export const Fields = [
  { type: 'text', placeholder: 'Full Name*', id: 'name', isRequired: true },
  { type: 'email', placeholder: 'Email address*', id: 'email', isRequired: true },
  { type: 'password', placeholder: 'Password*', id: 'password', isRequired: true },
  {
    type: 'radio', placeholder: 'Blood Group*', id: 'blood_group', isRequired: true, options: [
      { value: 'O+', label: 'O+' },
      { value: 'A+', label: 'A+' },
      { value: 'B+', label: 'B+' },
      { value: 'AB+', label: 'AB+' },
      { value: 'O-', label: 'O-' },
      { value: 'A-', label: 'A-' },
      { value: 'B-', label: 'B-' },
    ]
  },
  { type: 'date', placeholder: 'Date Of Birth', id: 'dob' },
  { type: 'text', placeholder: 'Address', id: 'address' },
  {
    type: 'radio', placeholder: 'Gender', id: 'gender', options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
    ]
  }
];

export const DoctorFields = [
  { type: 'text', placeholder: 'Full Name*', id: 'name', isRequired: true },
  { type: 'email', placeholder: 'Email address*', id: 'email', isRequired: true },
  { type: 'password', placeholder: 'Password*', id: 'password', isRequired: true },
  { type: 'text', placeholder: 'Specialization*', id: 'specialization', isRequired: true },
  { type: 'text', placeholder: 'Phone*', id: 'phone', isRequired: true },
  { type: 'date', placeholder: 'Date Of Birth', id: 'dob' },
  { type: 'text', placeholder: 'Address', id: 'address' },
  {
    type: 'radio', placeholder: 'Gender', id: 'gender', options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
    ]
  }

]

export function useSignUpPage(type) {
  const { setUserPatient, setUserDoctor } = useUser();
  const { showToastFor5s } = useContext(ToastContext);
  const navigate = useNavigate();
  const [signUpLoadingState, setSignUpLoadingState] = useState('isInit');
  const isDoctor = type === 'doctor';
  const formFields = isDoctor ? DoctorFields : Fields;

  const onSubmitSignUp = async (e) => {
    e.preventDefault();
    const formValues = formFields.reduce((p, c) => ({ ...p, [c.id]: e.target[c.id].value }), {});
    try {
      setSignUpLoadingState('isLoading');
      if (isDoctor) {
        await setUserDoctor(formValues);
      } else {
        await setUserPatient(formValues);
      }
      setSignUpLoadingState('isSuccess');
      const toastText = "User " + formValues.email + ' successful!!';
      showToastFor5s({ toastText });
    } catch {
      setSignUpLoadingState('isFail');
      const toastText = "User " + formValues.email + ' failed😟';
      showToastFor5s({ toastText, toastType: 'danger' });
    } finally {
      navigate(type ? '/login/' + type : '/login');
    }
  }

  return { onSubmitSignUp, signUpLoadingState }
}