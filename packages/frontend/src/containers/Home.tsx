import { useState, useEffect } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { useAppContext } from "../lib/contextLib";
import { API } from "aws-amplify";
import { ScheduleType } from "../types/schedule"; // Update import statement
import { onError } from "../lib/errorLib";
import { BsPencilSquare } from "react-icons/bs";
import { LinkContainer } from "react-router-bootstrap";
import "./Home.css";

export default function Home() {
  const [schedules, setSchedules] = useState<Array<ScheduleType>>([]); // Update state and type
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) {
        return;
      }

      try {
        const schedules = await loadSchedules(); // Update function call
        setSchedules(schedules);
      } catch (e) {
        onError(e);
      }

      setIsLoading(false);
    }

    onLoad();
  }, [isAuthenticated]);

  function loadSchedules() {
    return API.get("schedules", "/schedules", {}); // Update API call
  }

  function formatDate(str: undefined | string) {
    return !str ? "" : new Date(str).toLocaleString();
  }

  function renderSchedulesList(schedules: ScheduleType[]) {
    return (
      <>
        <LinkContainer to="/schedules/new"> {/* Update route */}
          <ListGroup.Item action className="py-3 text-nowrap text-truncate">
            <BsPencilSquare size={17} />
            <span className="ms-2 fw-bold">Create a new schedule</span>
          </ListGroup.Item>
        </LinkContainer>
        {schedules.map(({ scheduleId, employeeName, createdAt }) => ( // Update attribute names
          <LinkContainer key={scheduleId} to={`/schedules/${scheduleId}`}> {/* Update route */}
            <ListGroup.Item action className="text-nowrap text-truncate">
              <span className="fw-bold">{employeeName}</span>
              <br />
              <span className="text-muted">
                Created: {formatDate(createdAt)}
              </span>
            </ListGroup.Item>
          </LinkContainer>
        ))}
      </>
    );
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1>Scratch</h1>
        <p className="text-muted">A simple scheduling app</p> {/* Update app description */}
      </div>
    );
  }

  function renderSchedules() {
    return (
      <div className="schedules"> {/* Update class name */}
        <h2 className="pb-3 mt-4 mb-3 border-bottom">Your Schedules</h2> {/* Update heading */}
        <ListGroup>{!isLoading && renderSchedulesList(schedules)}</ListGroup> {/* Update function call */}
      </div>
    );
  }

  return (
    <div className="Home">
      {isAuthenticated ? renderSchedules() : renderLander()} {/* Update function call */}
    </div>
  );
}
