import rules from './rules';
import buildRoles from './roles';
import Access from './Access';


const roles = buildRoles(rules);
Access.setRoles(roles);
const can = user => new Access(user);


export { can, roles };
