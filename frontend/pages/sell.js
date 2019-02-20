import Link from 'next/link';
import CreateItem from '../components/CreateItem';
import AuthWall from '../components/AuthWall';

const Sell = props => (
  <div>
    <AuthWall>
      <CreateItem />
    </AuthWall>
  </div>
)

export default Sell;