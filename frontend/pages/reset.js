import Link from 'next/link';
import Reset from '../components/Reset';

const ResetPage = props => (
  <div>
    <p>reset your password {props.query.resetToken}</p>
    <Reset resetToken={props.query.resetToken} />
  </div>
)

export default ResetPage;