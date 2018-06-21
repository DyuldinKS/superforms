import { connect } from 'react-redux';
import Breadcrumb from 'apps/app/shared/components/NavBreadcrumb';

import { selectors as sessionQuery } from 'apps/app/shared/redux/session';
import { selectors as orgQuery } from 'apps/app/shared/redux/orgs';

function mapStateToProps(state, { id }) {
  const sessionOrgId = sessionQuery.getOrgId(state);
  const breadcrumb = orgQuery.getBreadcrumb(state, sessionOrgId, id);
  // unlink last breadcrumb element
  delete breadcrumb[breadcrumb.length - 1].link;

  return { breadcrumb };
}

export default connect(mapStateToProps)(Breadcrumb);
