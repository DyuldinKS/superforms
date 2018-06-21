import { connect } from 'react-redux';
import Breadcrumb from 'apps/app/shared/components/NavBreadcrumb';

import { selectors as sessionQuery } from 'apps/app/shared/redux/session';
import { selectors as orgQuery } from 'apps/app/shared/redux/orgs';
import { selectors as userQuery } from 'apps/app/shared/redux/users';
import { selectors as formQuery } from 'apps/app/shared/redux/forms';

const getLink = id => `/user/${id}`;

function mapStateToProps(state, { id }) {
  let breadcrumb = [];
  const session = sessionQuery.getStore(state);
  const form = formQuery.getFormEntity(state, id);
  const { ownerId } = form;

  if (ownerId === session.userId) {
    breadcrumb.push({ label: 'Ваши формы', link: '/' });
  } else {
    const owner = userQuery.getUserEntity(state, ownerId);
    const toOrg = orgQuery.getBreadcrumb(state, session.orgId, owner.orgId);
    breadcrumb = breadcrumb.concat(toOrg);

    breadcrumb.push({
      label: userQuery.getShortName(state, ownerId),
      link: getLink(ownerId),
    });
  }

  breadcrumb.push({ label: form.title });

  return { breadcrumb };
}

export default connect(mapStateToProps)(Breadcrumb);
