import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API, Storage } from "aws-amplify";
import { onError } from "../lib/errorLib";
import config from "../config";
import Form from "react-bootstrap/Form";
import { NoteType } from "../types/note";
import { ScheduleType } from "../types/schedule";
import Stack from "react-bootstrap/Stack";
import LoaderButton from "../components/LoaderButton";
import { s3Upload } from "../lib/awsLib";
import "./Notes.css";

export default function Notes() {
  const file = useRef<null | File>(null)
  const { id } = useParams();
  const nav = useNavigate();
  // const [note, setNote] = useState<null | NoteType>(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [schedule, setSchedule] = useState<null | ScheduleType>(null);
  const [employeeName, setEmployeeName] = useState("");
  const [workType, setWorkType] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [tipMethod, setTipMethod] = useState("");
  const [tipAmount, setTipAmount] = useState(0);


  useEffect(() => {
    function loadSchedule() {
      return API.get("schedules", `/schedules/${id}`, {});
    }

    async function onLoad() {
      try {
        const schedule = await loadSchedule();
        // ... (existing code)
        setEmployeeName(schedule.employeeName);
        setWorkType(schedule.workType);
        setWorkTime(schedule.workTime);
        setPaymentMethod(schedule.paymentMethod);
        setPaymentAmount(schedule.paymentAmount);
        setTipMethod(schedule.tipMethod);
        setTipAmount(schedule.tipAmount);

      } catch (e) {
        onError(e);
      }
    }

    onLoad();
  }, [id]);

  function validateForm() {
    return content.length > 0;
  }
  
  function formatFilename(str: string) {
    return str.replace(/^\w+-/, "");
  }
  
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.currentTarget.files === null) return;
    file.current = event.currentTarget.files[0];
  }
  
  async function saveSchedule(schedule: ScheduleType) {
    return API.put("schedules", `/schedules/${id}`, {
      body: schedule,
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    let attachment;

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
      if (file.current) {
        attachment = await s3Upload(file.current);
      } else if (schedule && schedule.attachment) {
        attachment = schedule.attachment;
      }

      await saveSchedule({
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
  
  function deleteNote() {
    return API.del("notes", `/notes/${id}`, {});
  }
  
  async function handleDelete(event: React.FormEvent<HTMLModElement>) {
    event.preventDefault();
  
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );
  
    if (!confirmed) {
      return;
    }
  
    setIsDeleting(true);
  
    try {
      await deleteNote();
      nav("/");
    } catch (e) {
      onError(e);
      setIsDeleting(false);
    }
  }
  
  return (
    <div className="Notes">
      {schedule && (
        <Form onSubmit={handleSubmit}>
          <Stack gap={3}>
            <Form.Group controlId="employeeName">
              <Form.Label>Employee Name</Form.Label>
              <Form.Control
                size="lg"
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="workType">
              <Form.Label>Work Type</Form.Label>
              <Form.Control
                size="lg"
                type="text"
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="workTime">
              <Form.Label>Work Time</Form.Label>
              <Form.Control
                size="lg"
                type="text"
                value={workTime}
                onChange={(e) => setWorkTime(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="paymentMethod">
              <Form.Label>Payment Method</Form.Label>
              <Form.Control
                size="lg"
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="paymentAmount">
              <Form.Label>Payment Amount</Form.Label>
              <Form.Control
                size="lg"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
              />
            </Form.Group>
            <Form.Group controlId="tipMethod">
              <Form.Label>Tip Method</Form.Label>
              <Form.Control
                size="lg"
                type="text"
                value={tipMethod}
                onChange={(e) => setTipMethod(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="tipAmount">
              <Form.Label>Tip Amount</Form.Label>
              <Form.Control
                size="lg"
                type="number"
                value={tipAmount}
                onChange={(e) => setTipAmount(Number(e.target.value))}
              />
            </Form.Group>
            <Form.Group className="mt-2" controlId="file">
              <Form.Label>Attachment</Form.Label>
              {schedule.attachment && (
                <p>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={schedule.attachmentURL}
                  >
                    {formatFilename(schedule.attachment)}
                  </a>
                </p>
              )}
              <Form.Control onChange={handleFileChange} type="file" />
            </Form.Group>
            <Stack gap={1}>
              <LoaderButton
                size="lg"
                type="submit"
                isLoading={isLoading}
                disabled={!validateForm()}
              >
                Save
              </LoaderButton>
              <LoaderButton
                size="lg"
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Delete
              </LoaderButton>
            </Stack>
          </Stack>
        </Form>
      )}
    </div>
  );
  
}