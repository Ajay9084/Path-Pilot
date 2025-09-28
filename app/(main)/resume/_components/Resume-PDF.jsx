import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Simple plain PDF styles (no gradients, no unsupported CSS)
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "Helvetica", lineHeight: 1.5 },
  header: { fontSize: 20, textAlign: "center", marginBottom: 10 },
  subHeader: { fontSize: 14, fontWeight: "bold", marginTop: 10, marginBottom: 5 },
  section: { marginBottom: 8 },
  text: { marginBottom: 2 },
});

export default function ResumePDF({ resumeData, user }) {
  const { contactInfo, summary, skills, experience, education, projects } = resumeData;

  const renderEntries = (entries) =>
    entries?.map((e, i) => (
      <View key={i} style={styles.section}>
        {Object.entries(e).map(([key, value]) => (
          <Text key={key} style={styles.text}>
            {key}: {value}
          </Text>
        ))}
      </View>
    ));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{user?.fullName || "Your Name"}</Text>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Contact Info</Text>
          {contactInfo?.email && <Text>Email: {contactInfo.email}</Text>}
          {contactInfo?.mobile && <Text>Mobile: {contactInfo.mobile}</Text>}
          {contactInfo?.linkedin && <Text>LinkedIn: {contactInfo.linkedin}</Text>}
          {contactInfo?.twitter && <Text>Twitter: {contactInfo.twitter}</Text>}
        </View>

        {summary && (
          <View style={styles.section}>
            <Text style={styles.subHeader}>Professional Summary</Text>
            <Text>{summary}</Text>
          </View>
        )}

        {skills && (
          <View style={styles.section}>
            <Text style={styles.subHeader}>Skills</Text>
            <Text>{skills}</Text>
          </View>
        )}

        {experience?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subHeader}>Work Experience</Text>
            {renderEntries(experience)}
          </View>
        )}

        {education?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subHeader}>Education</Text>
            {renderEntries(education)}
          </View>
        )}

        {projects?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subHeader}>Projects</Text>
            {renderEntries(projects)}
          </View>
        )}
      </Page>
    </Document>
  );
}
