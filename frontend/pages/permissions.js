import AuthWall from '../components/AuthWall';
import Permissions from '../components/Permissions';

const PermissionsPage = props => (
  <div>
    <AuthWall>
      <Permissions />
    </AuthWall>
  </div>
)

export default PermissionsPage;