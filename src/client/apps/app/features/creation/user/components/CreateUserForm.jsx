import React from 'react';
import { Button } from 'reactstrap';
import locales from 'Locales/entities';
import createForm from 'shared/form/components/createForm';
import FormInput from 'shared/form/components/FormInput';
import formatValues from 'shared/form/utils/formatValues';
import Spinner from 'shared/ui/Spinner';
import ROLES from 'apps/app/shared/redux/users/roles';
import { ErrorPanel, BaseCreateForm } from '../../shared/components';
import fields from './fields';

class CreateUserForm extends BaseCreateForm {
  constructor(props) {
    super(props);

    this.getRoles(fields.role.options);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.sessionRole !== this.props.sessionRole) {
      this.getRoles(fields.role.options);
    }
  }

  formatValues() {
    const values = formatValues(fields, this.props.values);

    const selectedRoleIndex = Object.keys(values.role)[0];
    values.role = this.roleValues[selectedRoleIndex];

    delete values.org;
    return values;
  }

  getRoles(options) {
    this.roleValues = this.filterRoles(options);
    this.roleLocales = this.translateRoles(this.roleValues);
  }

  filterRoles(options) {
    const { sessionRole } = this.props;

    if (sessionRole !== ROLES.ROOT) {
      return options.filter(o => o !== ROLES.ROOT);
    }

    return options;
  }

  translateRoles(options) {
    return options.map(o => locales.role[o]);
  }

  render() {
    const { getRef, submitting, submitError } = this.props;

    return (
      <form ref={getRef} noValidate onSubmit={this.handleSubmit}>
        <div className="row">
          <div className="col-6 mr-auto">
            <FormInput
              id="lastName"
              {...fields.lastName}
            />
            <FormInput
              id="firstName"
              {...fields.firstName}
            />
            <FormInput
              id="patronymic"
              {...fields.patronymic}
            />
            <FormInput
              id="email"
              {...fields.email}
            />
            <FormInput
              id="org"
              {...fields.org}
            />
            <FormInput
              id="role"
              {...fields.role}
              options={this.roleLocales}
            />

            {
              submitError && <ErrorPanel message={submitError} />
            }
            <div className="text-right">
              <Button
                type="submit"
                color="primary"
                size="lg"
                disabled={submitting}
              >
                {
                  submitting && <Spinner />
                }
                {' '}Создать
              </Button>
            </div>
          </div>
        </div>
      </form>
    );
  }
}

export default createForm(CreateUserForm);
