import Link from 'next/link';
// import CreateItem from '../components/CreateItem';
import SignUp from '../components/SignUp'
import styled from 'styled-components';

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`;

const Signup = props => (
  <Columns>
    <SignUp />
    <SignUp />
    <SignUp />
  </Columns>
)

export default Signup;