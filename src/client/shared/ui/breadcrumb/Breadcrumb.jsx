import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb as BtrapBreadcrumb, BreadcrumbItem } from 'reactstrap';
import { Link } from 'shared/router/components';

const propTypes = {
  breadcrumb: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      link: PropTypes.string,
    }),
  ),
  className: PropTypes.string,
};

const defaultProps = {
  breadcrumb: [],
  className: '',
};

function Breadcrumb({ breadcrumb, className }) {
  if (!breadcrumb.length) {
    return null;
  }

  return (
    <BtrapBreadcrumb className={className}>
      {
        breadcrumb.map(({ label, link }, index) => (
          <BreadcrumbItem
            key={label}
            active={index === breadcrumb.length - 1}
          >
            {
              !link
                ? label
                : <Link to={link}>
                    {label}
                  </Link>
            }
          </BreadcrumbItem>
        ))
      }
    </BtrapBreadcrumb>
  );
}

Breadcrumb.propTypes = propTypes;
Breadcrumb.defaultProps = defaultProps;

export default Breadcrumb;
