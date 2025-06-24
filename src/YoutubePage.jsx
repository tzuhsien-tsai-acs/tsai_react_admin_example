import * as React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const youtubeVideos = [
    {
        title: "動畫一（範例：Rickroll）",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
        title: "動畫二（範例：Google I/O 2021 Keynote）",
        url: "https://www.youtube.com/embed/Vt7l5q4L4Mc"
    },
    {
        title: "動畫三（範例：NASA 火箭動畫）",
        url: "https://www.youtube.com/embed/21X5lGlDOfg"
    }
];

const YoutubePage = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '80vh' }}>
        <Card style={{ width: 800, maxWidth: '98%' }}>
            <CardContent>
                <Typography variant="h5" component="h2" gutterBottom align="center">
                    YouTube 動畫展示
                </Typography>
                <Grid container spacing={3}>
                    {youtubeVideos.map((video, idx) => (
                        <Grid item xs={12} md={6} key={idx}>
                            <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
                                {video.title}
                            </Typography>
                            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                                <iframe
                                    src={video.url}
                                    title={video.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                    }}
                                />
                            </div>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    </div>
);

export default YoutubePage;