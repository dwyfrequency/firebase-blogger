interface Props {
  show: boolean;
}

// Loading Spinner
export default function Loader({ show }: Props) {
  return show ? <div className="loader"></div> : null;
}
