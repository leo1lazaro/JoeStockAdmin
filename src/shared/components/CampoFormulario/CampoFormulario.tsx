import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import './CampoFormulario.css';
export function CampoFormulario({ rotulo, ...props }: InputHTMLAttributes<HTMLInputElement> & { rotulo: string }) {
  return <label className="CampoFormulario"><span>{rotulo}</span><input {...props} /></label>;
}
export function CampoArea({ rotulo, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { rotulo: string }) {
  return <label className="CampoFormulario"><span>{rotulo}</span><textarea {...props} /></label>;
}
