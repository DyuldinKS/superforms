import { connect } from 'react-redux';
import Breadcrumb from 'apps/app/shared/components/NavBreadcrumb';

import { selectors as sessionQuery } from 'apps/app/shared/redux/session';
import { selectors as orgQuery } from 'apps/app/shared/redux/orgs';
import { selectors as userQuery } from 'apps/app/shared/redux/users';

function mapStateToProps(state, { id }) {
  const session = sessionQuery.getStore(state);
  console.log(id);
  console.log(session.userId);


  if (id === session.userId) {
    return { breadcrumb: [{ label: 'Ваш профиль' }] };
  }

  const user = userQuery.getUserEntity(state, id);
  const breadcrumb = orgQuery.getBreadcrumb(state, session.orgId, user.orgId);

  breadcrumb.push({ label: userQuery.getShortName(state, id) });

  return { breadcrumb };
}

export default connect(mapStateToProps)(Breadcrumb);
