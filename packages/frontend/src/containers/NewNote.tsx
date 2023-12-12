import React, {useRef, useState} from "react";
import Form from "react-bootstrap/Form";
import {useNavigate} from "react-router-dom";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import { API } from "aws-amplify";
// import { NoteType } from "../types/note";
import { ScheduleType } from "../types/schedule"; // Make sure to create ScheduleType in your types folder
import { onError } from "../lib/errorLib";
import { s3Upload } from "../lib/awsLib";
import "./NewNote.css";

export default function NewNote() {
  const file = useRef<null | File>(null);
  const nav = useNavigate();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [employeeName, setEmployeeName] = useState("");
  const [workType, setWorkType] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [tipMethod, setTipMethod] = useState("");
  const [tipAmount, setTipAmount] = useState(0);

  function validateForm() {
    return content.length > 0;
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if ( event.currentTarget.files === null ) return
    file.current = event.currentTarget.files[0];
  }

  function createSchedule(schedule: ScheduleType) {
    return API.post("schedules", "/schedules", {
      body: schedule,
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${
          config.MAX_ATTACHMENT_SIZE / 1000000
        } MB.`
      );
      return;
    }

    setIsLoading(true);

    try {
      const attachment = file.current
        ? await s3Upload(file.current)
        : undefined;

      await createSchedule({
        employeeName,
        workType,
        workTime,
        paymentMethod,
        paymentAmount,
        tipMethod,
        tipAmount,
        attachment,
      });
      nav("/");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }

  return (
    <div className="NewNote">
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="employeeName">
          <Form.Label>Employee Name</Form.Label>
          <Form.Control
            value={employeeName}
            type="text"
            onChange={(e) => setEmployeeName(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="workType">
          <Form.Label>Work Type</Form.Label>
          <Form.Control
            value={workType}
            type="text"
            onChange={(e) => setWorkType(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="workTime">
          <Form.Label>Work Time</Form.Label>
          <Form.Control
            value={workTime}
            type="text"
            onChange={(e) => setWorkTime(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="paymentMethod">
          <Form.Label>Payment Method</Form.Label>
          <Form.Control
            value={paymentMethod}
            type="text"
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="paymentAmount">
          <Form.Label>Payment Amount</Form.Label>
          <Form.Control
            value={paymentAmount}
            type="number"
            onChange={(e) => setPaymentAmount(Number(e.target.value))}
          />
        </Form.Group>
        <Form.Group controlId="tipMethod">
          <Form.Label>Tip Method</Form.Label>
          <Form.Control
            value={tipMethod}
            type="text"
            onChange={(e) => setTipMethod(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="tipAmount">
          <Form.Label>Tip Amount</Form.Label>
          <Form.Control
            value={tipAmount}
            type="number"
            onChange={(e) => setTipAmount(Number(e.target.value))}
          />
        </Form.Group>
        <Form.Group className="mt-2" controlId="file">
          <Form.Label>Attachment</Form.Label>
          <Form.Control onChange={handleFileChange} type="file" />
        </Form.Group>
        <LoaderButton
          size="lg"
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!validateForm()}
        >
          Create
        </LoaderButton>
      </Form>
    </div>
  );
  
}
