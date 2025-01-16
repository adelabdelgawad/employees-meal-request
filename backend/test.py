import csv

def create_tasks_csv(filename: str) -> None:
    """
    Create a CSV file containing the tasks scheduled for March.
    
    Args:
        filename (str): The path or filename where the CSV will be saved.

    Returns:
        None
    
    Raises:
        IOError: If there's an issue writing to the CSV file.

    Example:
        create_tasks_csv("Tasks_March.csv")
    """
    headers = [
        "Main Objectives",
        "Scope",
        "Entity",
        "Department",
        "Process / Project",
        "Process Name / Project Name",
        "Accountable Leader",
        "Project Milestone / Sub Process Name (High Level Task)",
        "Task Description",
        "Task Owner (Responsible)",
        "Periority (Per Task)",
        "Functional Contribution (Per Task)",
        "Progress Status (Per Task)",
        "KPI Type",
        "KPI Impact",
        "Outcome / Output KPI Name",
        "Actual",
        "Target",
        "Baseline",
        "Start Date",
        "End Date"
    ]

    rows = [
        [
            "ARC Windows Client Upgrade to Latest Version",
            "ARC",
            "",
            "IT",
            "Project",
            "",
            "",
            """* Evaluate current Windows versions used across ARC workstations
* Schedule upgrade rollout to the latest Windows client version
* Validate and troubleshoot upgrades to ensure stability""",
            "Upgrade all ARC Windows clients to the newest supported version, ensuring compatibility and minimal downtime.",
            "",
            "Normal",
            "",
            "Not Done",
            "",
            "",
            "All ARC Clients Upgraded",
            "0",
            "100",
            "",
            "",
            "30/03/2025"
        ],
        [
            "SMH Server Room Transferee to 4th Floor",
            "SMH",
            "",
            "IT",
            "Project",
            "",
            "",
            """* Plan physical relocation of the server room to the 4th floor
* Coordinate power, cooling, and network requirements
* Execute safe transfer of servers and related equipment""",
            "Relocate the current server infrastructure to the new 4th floor location without impacting critical hospital services.",
            "",
            "Normal",
            "",
            "Not Done",
            "",
            "",
            "Server Room Successfully Moved",
            "0",
            "100",
            "",
            "",
            "30/03/2025"
        ],
        [
            "ARC and ANC Internet Lines Merge",
            "ARC, ANC",
            "",
            "IT",
            "Project",
            "",
            "",
            """* Assess current internet connectivity at ARC and ANC
* Design a unified network line merge plan
* Implement and test merged internet lines for stable connectivity""",
            "Combine ARC and ANC internet lines into a single, more robust connection to improve bandwidth and redundancy.",
            "",
            "Normal",
            "",
            "Not Done",
            "",
            "",
            "Lines Successfully Merged",
            "0",
            "100",
            "",
            "",
            "30/03/2025"
        ],
        [
            "Unified Request Page for All Serverdesks",
            "",
            "",
            "IT",
            "Project",
            "",
            "",
            """* Analyze the requirements from different server desks
* Develop a single interface consolidating all request types
* Test and refine to ensure seamless user experience""",
            "Create a unified request portal to handle all server desk requests in one place, streamlining internal IT processes.",
            "",
            "Normal",
            "",
            "Not Done",
            "",
            "",
            "Single Request Page Deployed",
            "0",
            "100",
            "",
            "",
            "30/03/2025"
        ],
        [
            "ANC Veeam Backup Upgrade",
            "ANC",
            "",
            "IT",
            "Project",
            "",
            "",
            """* Review current Veeam version and identify upgrade steps
* Coordinate downtime window if needed
* Perform the upgrade and validate successful backups""",
            "Upgrade ANC’s Veeam backup solution to the latest stable release, ensuring data integrity and minimal disruption.",
            "",
            "Normal",
            "",
            "Not Done",
            "",
            "",
            "Veeam Upgraded Successfully",
            "0",
            "100",
            "",
            "",
            "30/03/2025"
        ],
        [
            "ARC POE Devices Dashboard Management",
            "ARC",
            "",
            "IT",
            "Project",
            "",
            "",
            """* Identify all POE-powered devices within ARC
* Implement or configure a central dashboard for monitoring
* Set alerts and performance thresholds for proactive maintenance""",
            "Develop a centralized management dashboard for ARC’s POE devices to enhance monitoring and troubleshooting capabilities.",
            "",
            "Normal",
            "",
            "Not Done",
            "",
            "",
            "POE Dashboard Implemented",
            "0",
            "100",
            "",
            "",
            "30/03/2025"
        ]
    ]

    try:
        with open(filename, mode="w", newline="", encoding="utf-8") as csv_file:
            writer = csv.writer(csv_file, quoting=csv.QUOTE_ALL)
            writer.writerow(headers)
            for row in rows:
                writer.writerow(row)
        print(f"CSV file '{filename}' created successfully.")
    except IOError as e:
        raise IOError(f"Could not write to file: {e}")

# Example usage:
create_tasks_csv("Tasks_March.csv")
