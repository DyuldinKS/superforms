import React from 'react';
import { Button } from 'reactstrap';
import createForm from 'shared/form/components/createForm';
import FormInput from 'shared/form/components/FormInput';
import formatValues from 'shared/form/utils/formatValues';
import Spinner from 'shared/ui/Spinner';
import { ErrorPanel, BaseCreateForm } from '../../shared/components';
import fields from './fields';

class CreateOrgForm extends BaseCreateForm {
  formatValues() {
    const values = formatValues(fields, this.props.values);
    delete values.org;
    return values;
  }

  render() {
    const { getRef, submitting, submitError } = this.props;

    return (
      <form ref={getRef} noValidate onSubmit={this.handleSubmit}>
        <div className="row">
          <div className="col-6 mr-auto">
            <FormInput
              id="label"
              {...fields.label}
            />
            <FormInput
              id="fullName"
              {...fields.fullName}
            />
            <FormInput
              id="email"
              {...fields.email}
            />
            <FormInput
              id="org"
              {...fields.org}
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

export default createForm(CreateOrgForm);
