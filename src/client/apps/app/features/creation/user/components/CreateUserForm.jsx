import React from 'react';
import { Button } from 'reactstrap';
import locales from 'Locales/entities';
import createForm from 'shared/form/components/createForm';
import FormInput from 'shared/form/components/FormInput';
import formatValues from 'shared/form/utils/formatValues';
import Spinner from 'shared/ui/Spinner';
import { ErrorPanel, BaseCreateForm } from '../../shared/components';
import fields from './fields';

const { role: rolesMap } = locales;
const rolesNames = Object.keys(rolesMap);

class CreateUserForm extends BaseCreateForm {
  formatValues() {
    const values = formatValues(fields, this.props.values);

    const selectedRoleIndex = Object.keys(values.role)[0];
    const selectedRoleLabel = fields.role.options[selectedRoleIndex];
    values.role = rolesNames.find(role =>
      rolesMap[role] === selectedRoleLabel);

    return values;
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
